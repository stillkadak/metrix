from typing import Any, Dict, List
import hashlib
import logging

from .field_extractor import FieldExtractor

logger = logging.getLogger(__name__)

# Realistic sample label texts used by DEMO MODE when no OCR engine is
# installed on the machine. This lets the whole app (upload -> OCR ->
# extraction -> compliance rules -> dashboard) work immediately after
# `pip install -r requirements.txt`, with zero extra system installs.
# Once Tesseract (or PaddleOCR) is installed, real OCR takes over
# automatically - nothing else needs to change.
_DEMO_LABELS: List[str] = [
    (
        "FRESH FARM COOKIES\n"
        "Net Wt: 250 g\n"
        "MRP: Rs. 99.00 (Inclusive of all taxes)\n"
        "Mfg: 03/2026\n"
        "Best Before: 09/2026\n"
        "Manufactured By: Sunrise Foods Pvt Ltd, Plot 12, MIDC, Pune, Maharashtra 411019\n"
        "Consumer Care: 1800-123-4567, care@sunrisefoods.example\n"
        "Made in India"
    ),
    (
        "GLOW SHAMPOO\n"
        "Net Contents: 180 ml\n"
        "Price: Rs. 149\n"
        "Mfg By: Clearwater Cosmetics Ltd\n"
        "Country of Origin: India"
        # Deliberately missing MRP currency symbol, mfg date, consumer care
    ),
    (
        "ORGANIC HONEY\n"
        "Net Qty: 500 g\n"
        "MRP Rs. 320.00\n"
        "Mfg: 11/2025  Exp: 11/2027\n"
        "Manufactured By: Beekeeper's Co-op, 45 Hill Road, Ooty, Tamil Nadu\n"
        "Customer Care: support@beecoop.example\n"
        "Product of India"
    ),
    (
        "CRUNCHY TIME CHIPS\n"
        # Deliberately sparse label - triggers several critical violations
        "Made by ABC Snacks"
    ),
]


class OCRService:
    """OCR Service for extracting text from packaging images.

    Tries, in order:
      1. PaddleOCR (best accuracy, heavy install) - only if already installed.
      2. Tesseract via pytesseract + Pillow (lightweight, needs the
         `tesseract` system binary).
      3. DEMO MODE - deterministic sample label text, so the feature is
         still usable end-to-end with no OCR engine installed at all.
    """

    def __init__(self):
        self.engine_name = "demo"
        self._paddle_ocr = None
        self._init_paddle_ocr()
        self.field_extractor = FieldExtractor()

    def _init_paddle_ocr(self) -> None:
        try:
            from paddleocr import PaddleOCR  # type: ignore

            self._paddle_ocr = PaddleOCR(use_angle_cls=True, lang="en", show_log=False, use_gpu=False)
            self.engine_name = "paddleocr"
            logger.info("PaddleOCR initialized successfully")
        except Exception:
            self._paddle_ocr = None

    def _tesseract_available(self) -> bool:
        try:
            import pytesseract  # noqa: F401
            from PIL import Image  # noqa: F401
        except ImportError:
            return False
        try:
            import pytesseract

            pytesseract.get_tesseract_version()
            return True
        except Exception:
            return False

    def extract_text(self, image_path: str) -> Dict[str, Any]:
        """Extract text and bounding boxes from an image."""
        if self._paddle_ocr is not None:
            try:
                return self._extract_with_paddle(image_path)
            except Exception as e:
                logger.error(f"PaddleOCR failed, falling back: {e}")

        if self._tesseract_available():
            try:
                return self._extract_with_tesseract(image_path)
            except Exception as e:
                logger.error(f"Tesseract failed, falling back to demo mode: {e}")

        return self._extract_demo(image_path)

    def _extract_with_paddle(self, image_path: str) -> Dict[str, Any]:
        result = self._paddle_ocr.ocr(image_path, cls=True)
        text_blocks, full_text = [], ""
        for line in result or []:
            for word_info in line or []:
                bbox, (text, confidence) = word_info[0], word_info[1]
                text_blocks.append({"text": text, "bbox": bbox, "confidence": confidence})
                full_text += text + " "
        return {"text": full_text.strip(), "blocks": text_blocks, "engine": "paddleocr"}

    def _extract_with_tesseract(self, image_path: str) -> Dict[str, Any]:
        import pytesseract
        from PIL import Image, ImageOps

        image = Image.open(image_path).convert("L")
        image = ImageOps.autocontrast(image)

        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        text_blocks, full_text = [], ""
        for i in range(len(data["text"])):
            conf = int(data["conf"][i]) if str(data["conf"][i]).lstrip("-").isdigit() else -1
            text = data["text"][i].strip()
            if conf > 0 and text:
                left, top = data["left"][i], data["top"][i]
                width, height = data["width"][i], data["height"][i]
                text_blocks.append({
                    "text": text,
                    "bbox": [[left, top], [left + width, top], [left + width, top + height], [left, top + height]],
                    "confidence": conf / 100,
                })
                full_text += text + " "
        return {"text": full_text.strip(), "blocks": text_blocks, "engine": "tesseract"}

    def _extract_demo(self, image_path: str) -> Dict[str, Any]:
        """Deterministic mock OCR so the pipeline works with no OCR engine installed.

        The same uploaded image always maps to the same sample label, and
        different images will usually map to different samples, which is
        enough to demo/dev against without any native OCR dependency.
        """
        try:
            with open(image_path, "rb") as f:
                digest = hashlib.md5(f.read()).hexdigest()
        except OSError:
            digest = hashlib.md5(image_path.encode()).hexdigest()

        index = int(digest, 16) % len(_DEMO_LABELS)
        text = _DEMO_LABELS[index]
        # Synthesize block-level data so downstream code that expects blocks
        # still works.
        blocks = [{"text": line, "bbox": None, "confidence": 0.75} for line in text.split("\n") if line.strip()]
        return {"text": text, "blocks": blocks, "engine": "demo"}

    def process_package(self, image_path: str) -> Dict[str, Any]:
        """Process a package image end-to-end and extract compliance fields."""
        ocr_result = self.extract_text(image_path)

        if ocr_result.get("error"):
            return ocr_result

        extracted_fields = self.field_extractor.extract_all_fields(ocr_result["text"], ocr_result["blocks"])

        blocks = ocr_result.get("blocks") or []
        confidences = [b["confidence"] for b in blocks if b.get("confidence") is not None]
        avg_confidence = round(sum(confidences) / len(confidences), 2) if confidences else 0.75

        return {
            "ocr_text": ocr_result["text"],
            "blocks": blocks,
            "extracted_fields": extracted_fields,
            "engine": ocr_result.get("engine", "unknown"),
            "ocr_confidence": avg_confidence,
        }
