import io
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

from ..models.scan import Scan
from ..models.user import User

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and print total page numbers."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count: int):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header line & title
        self.drawString(36, 762, "LEGAL METRIX SCANNER — OFFICIAL COMPLIANCE AUDIT REPORT")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(36, 754, 576, 754)
        
        # Footer line & details
        self.line(36, 45, 576, 45)
        self.drawString(36, 32, "Confidential — Legal Metrology (Packaged Commodities) Rules, 2011 Verification")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(576, 32, page_str)
        self.restoreState()


class PDFReportService:
    """Service to generate enterprise compliance PDF reports for Legal Metrology scans."""

    def generate_pdf(self, scan: Scan, db: Session) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            leftMargin=36,
            rightMargin=36,
            topMargin=54,
            bottomMargin=54,
        )

        styles = getSampleStyleSheet()
        
        # Custom typography styles
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=20,
            leading=24,
            textColor=colors.HexColor("#0F172A"),
            spaceAfter=4
        )
        
        subtitle_style = ParagraphStyle(
            'DocSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#475569"),
            spaceAfter=15
        )
        
        h2_style = ParagraphStyle(
            'SectionH2',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#0F172A"),
            spaceBefore=12,
            spaceAfter=6
        )

        body_style = ParagraphStyle(
            'BodyTextCustom',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#334155")
        )

        bold_body_style = ParagraphStyle(
            'BoldBodyCustom',
            parent=body_style,
            fontName='Helvetica-Bold'
        )

        story = []

        # Header Title
        story.append(Paragraph("Legal Metrology Compliance Report", title_style))
        scan_date_str = scan.scan_date.strftime("%B %d, %Y at %I:%M %p") if scan.scan_date else "N/A"
        story.append(Paragraph(f"Audit Reference ID: <b>{str(scan.id)}</b> &bull; Generated: {scan_date_str}", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceAfter=15))

        # Compliance Verdict Banner
        is_compliant = scan.is_compliant
        verdict_text = "COMPLIANT" if is_compliant else "NON-COMPLIANT / VIOLATIONS DETECTED"
        bg_color = colors.HexColor("#DCFCE7") if is_compliant else colors.HexColor("#FEE2E2")
        text_color = colors.HexColor("#15803D") if is_compliant else colors.HexColor("#B91C1C")
        border_color = colors.HexColor("#86EFAC") if is_compliant else colors.HexColor("#FCA5A5")

        verdict_style = ParagraphStyle(
            'VerdictText',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=16,
            textColor=text_color,
            alignment=1
        )

        verdict_p = Paragraph(f"VERDICT: {verdict_text}", verdict_style)
        verdict_table = Table([[verdict_p]], colWidths=[540])
        verdict_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), bg_color),
            ('BOX', (0, 0), (-1, -1), 1, border_color),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(verdict_table)
        story.append(Spacer(1, 15))

        # Executive Metrics Grid
        score_val = f"{round(scan.compliance_score, 1)}%" if scan.compliance_score is not None else "N/A"
        violations_count = str(len(scan.violations)) if scan.violations else "0"
        proc_time = f"{scan.processing_time_ms} ms" if scan.processing_time_ms else "N/A"
        ocr_conf = f"{round(scan.ocr_confidence * 100, 1)}%" if scan.ocr_confidence else "N/A"

        metrics_data = [
            [
                Paragraph("<b>Compliance Score</b>", body_style),
                Paragraph("<b>Total Violations</b>", body_style),
                Paragraph("<b>Processing Time</b>", body_style),
                Paragraph("<b>OCR Confidence</b>", body_style),
            ],
            [
                Paragraph(f"<font size=14 color='#0F172A'><b>{score_val}</b></font>", body_style),
                Paragraph(f"<font size=14 color='{'#15803D' if violations_count == '0' else '#B91C1C'}'><b>{violations_count}</b></font>", body_style),
                Paragraph(f"<font size=12 color='#334155'><b>{proc_time}</b></font>", body_style),
                Paragraph(f"<font size=12 color='#334155'><b>{ocr_conf}</b></font>", body_style),
            ]
        ]
        metrics_table = Table(metrics_data, colWidths=[135, 135, 135, 135])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        story.append(metrics_table)
        story.append(Spacer(1, 15))

        # Extracted Package Declarations Section
        story.append(Paragraph("Mandatory Package Declarations Extracted", h2_style))
        
        dec_data = [
            [Paragraph("<b>Declaration Field</b>", bold_body_style), Paragraph("<b>Extracted Content</b>", bold_body_style), Paragraph("<b>Status</b>", bold_body_style)]
        ]

        # Standard field mapping
        field_rules_map = {
            "mrp": "Maximum Retail Price (MRP)",
            "net_quantity": "Net Quantity / Weight",
            "manufacturing_date": "Date of Manufacture",
            "expiry_date": "Expiry / Best Before Date",
            "manufacturer": "Manufacturer Name & Details",
            "country_of_origin": "Country of Origin",
            "consumer_care": "Consumer Care Helpline/Email"
        }

        violations_field_set = {v.field_name for v in (scan.violations or []) if v.field_name}

        for field_key, field_label in field_rules_map.items():
            has_violation = field_key in violations_field_set
            found_text = "Detected on Label" if not has_violation else "Missing or Non-Compliant"
            status_tag = "<font color='#15803D'><b>PRESENT</b></font>" if not has_violation else "<font color='#B91C1C'><b>VIOLATION</b></font>"
            dec_data.append([
                Paragraph(field_label, body_style),
                Paragraph(found_text, body_style),
                Paragraph(status_tag, body_style)
            ])

        dec_table = Table(dec_data, colWidths=[180, 240, 120])
        dec_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(dec_table)
        story.append(Spacer(1, 15))

        # Violations Detail Section
        story.append(Paragraph(f"Detailed Legal Findings & Violations ({len(scan.violations or [])})", h2_style))

        if not scan.violations:
            no_viol_p = Paragraph("<font color='#15803D'><b>No legal metrology violations detected for this package label. All mandatory declarations comply with Legal Metrology (Packaged Commodities) Rules, 2011.</b></font>", body_style)
            no_viol_table = Table([[no_viol_p]], colWidths=[540])
            no_viol_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F0FDF4")),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#86EFAC")),
                ('TOPPADDING', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                ('LEFTPADDING', (0, 0), (-1, -1), 12),
                ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ]))
            story.append(no_viol_table)
        else:
            viol_rows = [
                [
                    Paragraph("<b>Rule Code</b>", bold_body_style),
                    Paragraph("<b>Severity</b>", bold_body_style),
                    Paragraph("<b>Rule Description & Requirement</b>", bold_body_style),
                    Paragraph("<b>Detected Value</b>", bold_body_style)
                ]
            ]

            for v in scan.violations:
                sev = (v.severity or "minor").upper()
                sev_color = "#B91C1C" if sev == "CRITICAL" else "#D97706" if sev in ("MAJOR", "HIGH") else "#475569"
                
                viol_rows.append([
                    Paragraph(f"<b>{v.rule_code}</b>", body_style),
                    Paragraph(f"<font color='{sev_color}'><b>{sev}</b></font>", body_style),
                    Paragraph(f"<b>{v.rule_description}</b><br/><font color='#64748B'>Required: {v.expected_value or 'Mandatory declaration'}</font>", body_style),
                    Paragraph(v.extracted_value or "<i>Not Found</i>", body_style)
                ])

            viol_table = Table(viol_rows, colWidths=[75, 75, 250, 140])
            viol_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#FEF2F2")),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#FCA5A5")),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#FEE2E2")),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            story.append(viol_table)

        story.append(Spacer(1, 15))

        # Raw OCR Log Section
        if scan.ocr_text:
            story.append(Paragraph("Raw OCR Text Extracted from Label", h2_style))
            ocr_style = ParagraphStyle(
                'OCRText',
                parent=body_style,
                fontName='Courier',
                fontSize=7.5,
                leading=9.5,
                textColor=colors.HexColor("#475569")
            )
            ocr_p = Paragraph(scan.ocr_text.replace('\n', '<br/>'), ocr_style)
            ocr_table = Table([[ocr_p]], colWidths=[540])
            ocr_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ]))
            story.append(ocr_table)

        doc.build(story, canvasmaker=NumberedCanvas)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
