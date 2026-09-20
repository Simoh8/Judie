"""
PDF Invoice Generation Service for Flown Application
Generates professional PDF invoices for subscription payments
"""

from django.conf import settings
from django.utils import timezone
from datetime import datetime
import os
from pathlib import Path
from decimal import Decimal


class PDFInvoiceService:
    """Service for generating PDF invoices"""
    
    @staticmethod
    def _build_invoice_elements(purchase):
        """
        Build the PDF elements for an invoice
        
        Args:
            purchase: Purchase model instance
            
        Returns:
            list: List of PDF elements
        """
        try:
            from reportlab.lib.pagesizes import letter, A4
            from reportlab.lib import colors
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch
            from reportlab.platypus import Table, TableStyle, Paragraph, Spacer
            from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
            
            # Get styles
            styles = getSampleStyleSheet()
            
            # Custom styles
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#1e293b'),
                spaceAfter=30,
                alignment=TA_CENTER
            )
            
            header_style = ParagraphStyle(
                'CustomHeader',
                parent=styles['Heading2'],
                fontSize=16,
                textColor=colors.HexColor('#334155'),
                spaceAfter=12
            )
            
            normal_style = ParagraphStyle(
                'CustomNormal',
                parent=styles['Normal'],
                fontSize=10,
                textColor=colors.HexColor('#475569'),
                spaceAfter=6
            )
            
            bold_style = ParagraphStyle(
                'CustomBold',
                parent=styles['Normal'],
                fontSize=10,
                textColor=colors.HexColor('#1e293b'),
                fontName='Helvetica-Bold',
                spaceAfter=6
            )
            
            # Build invoice content
            elements = []
            
            # Company header
            elements.append(Paragraph("INVOICE", title_style))
            elements.append(Spacer(1, 0.2*inch))
            
            # Company information
            company_data = [
                [Paragraph("<b>Flown</b>", bold_style),
                 Paragraph("Actually Doing", normal_style)],
                [Paragraph("", normal_style),
                 Paragraph("support@actuallydoing.com", normal_style)],
                [Paragraph("", normal_style),
                 Paragraph(f"Generated: {timezone.now().strftime('%B %d, %Y')}", normal_style)]
            ]
            
            company_table = Table(company_data, colWidths=[2*inch, 3*inch])
            company_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            
            elements.append(company_table)
            elements.append(Spacer(1, 0.3*inch))
            
            # Invoice details
            invoice_number = purchase.invoice_number or f"INV-{purchase.id}"
            invoice_date = purchase.payment_date or purchase.created_at
            
            invoice_details = [
                [Paragraph("<b>Invoice Number:</b>", bold_style),
                 Paragraph(invoice_number, normal_style)],
                [Paragraph("<b>Invoice Date:</b>", bold_style),
                 Paragraph(invoice_date.strftime('%B %d, %Y'), normal_style)],
                [Paragraph("<b>Due Date:</b>", bold_style),
                 Paragraph(invoice_date.strftime('%B %d, %Y'), normal_style)],
            ]
            
            invoice_table = Table(invoice_details, colWidths=[2*inch, 3*inch])
            invoice_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            
            elements.append(invoice_table)
            elements.append(Spacer(1, 0.3*inch))
            
            # Bill to section
            elements.append(Paragraph("Bill To:", header_style))
            
            user_name = f"{purchase.user.first_name} {purchase.user.last_name}".strip() or purchase.user.email
            bill_to_data = [
                [Paragraph(user_name, bold_style)],
                [Paragraph(purchase.user.email, normal_style)],
            ]
            
            bill_to_table = Table(bill_to_data, colWidths=[5*inch])
            bill_to_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            
            elements.append(bill_to_table)
            elements.append(Spacer(1, 0.3*inch))
            
            # Line items table
            elements.append(Paragraph("Invoice Details:", header_style))
            
            line_items = [
                ['Description', 'Period', 'Amount'],
                [
                    Paragraph(purchase.package.name, normal_style),
                    Paragraph(purchase.package.duration.capitalize(), normal_style),
                    Paragraph(f"${purchase.amount:.2f} {purchase.currency}", normal_style)
                ]
            ]
            
            line_items_table = Table(line_items, colWidths=[3*inch, 1.5*inch, 1.5*inch])
            line_items_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('TOPPADDING', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
                ('TOPPADDING', (0, 1), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ]))
            
            elements.append(line_items_table)
            elements.append(Spacer(1, 0.2*inch))
            
            # Total
            total_data = [
                ['', '', Paragraph(f"<b>Total: ${purchase.amount:.2f} {purchase.currency}</b>", bold_style)]
            ]
            
            total_table = Table(total_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
            total_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            
            elements.append(total_table)
            elements.append(Spacer(1, 0.4*inch))
            
            # Subscription details
            elements.append(Paragraph("Subscription Details:", header_style))
            
            subscription_data = [
                [Paragraph("<b>Valid From:</b>", bold_style),
                 Paragraph(purchase.valid_from.strftime('%B %d, %Y'), normal_style)],
                [Paragraph("<b>Valid Until:</b>", bold_style),
                 Paragraph(purchase.valid_until.strftime('%B %d, %Y'), normal_style)],
                [Paragraph("<b>Payment Method:</b>", bold_style),
                 Paragraph(purchase.payment_method.capitalize(), normal_style)],
                [Paragraph("<b>Status:</b>", bold_style),
                 Paragraph(purchase.status.capitalize(), normal_style)],
            ]
            
            subscription_table = Table(subscription_data, colWidths=[2*inch, 3*inch])
            subscription_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            
            elements.append(subscription_table)
            elements.append(Spacer(1, 0.4*inch))
            
            # Footer
            elements.append(Spacer(1, 0.2*inch))
            footer_text = Paragraph(
                "Thank you for your payment! If you have any questions about this invoice, please contact our support team.",
                normal_style
            )
            elements.append(footer_text)
            
            return elements
            
        except Exception as e:
            print(f"Error building invoice elements: {e}")
            return []
    
    @staticmethod
    def generate_invoice_pdf(purchase, output_path=None):
        """
        Generate a PDF invoice for a purchase
        
        Args:
            purchase: Purchase model instance
            output_path: Optional path to save the PDF file
            
        Returns:
            str: Path to the generated PDF file
        """
        try:
            from reportlab.lib.pagesizes import letter, A4
            from reportlab.platypus import SimpleDocTemplate
            
            # Create output directory if it doesn't exist
            if output_path is None:
                invoices_dir = Path(settings.MEDIA_ROOT) / 'invoices'
                invoices_dir.mkdir(parents=True, exist_ok=True)
                invoice_filename = f"invoice_{purchase.id}_{purchase.invoice_number or 'temp'}.pdf"
                output_path = str(invoices_dir / invoice_filename)
            
            # Create PDF document
            doc = SimpleDocTemplate(
                output_path,
                pagesize=A4,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=18
            )
            
            # Build PDF content
            elements = PDFInvoiceService._build_invoice_elements(purchase)
            
            # Build PDF
            doc.build(elements)
            
            return output_path
            
        except ImportError:
            # If reportlab is not installed, return None
            print("Warning: reportlab not installed. Install it with: pip install reportlab")
            return None
        except Exception as e:
            print(f"Error generating PDF invoice: {e}")
            return None
    
    @staticmethod
    def generate_invoice_pdf_bytes(purchase):
        """
        Generate a PDF invoice for a purchase and return as bytes
        
        Args:
            purchase: Purchase model instance
            
        Returns:
            bytes: PDF file content
        """
        try:
            from reportlab.lib.pagesizes import letter, A4
            from reportlab.platypus import SimpleDocTemplate
            import io
            
            print(f"Starting PDF generation for purchase {purchase.id}")
            
            # Create in-memory PDF
            buffer = io.BytesIO()
            
            # Create PDF document
            doc = SimpleDocTemplate(
                buffer,
                pagesize=A4,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=18
            )
            
            # Build PDF content
            elements = PDFInvoiceService._build_invoice_elements(purchase)
            
            if not elements:
                print("No elements generated for PDF")
                return None
            
            # Build PDF
            doc.build(elements)
            
            # Get PDF bytes
            pdf_bytes = buffer.getvalue()
            buffer.close()
            
            print(f"PDF generated successfully, size: {len(pdf_bytes)} bytes")
            return pdf_bytes
            
        except ImportError:
            # If reportlab is not installed, return None
            print("Warning: reportlab not installed. Install it with: pip install reportlab")
            return None
        except Exception as e:
            import traceback
            print(f"Error generating PDF invoice bytes: {e}")
            print(f"Traceback: {traceback.format_exc()}")
            return None
    
    @staticmethod
    def get_invoice_url(purchase):
        """
        Get the URL for an invoice PDF (secure API endpoint)
        
        Args:
            purchase: Purchase model instance
            
        Returns:
            str: URL to access the invoice PDF via secure API
        """
        if not purchase.invoice_number:
            return None
        
        # Return secure API endpoint URL instead of direct media path
        return f"/api/purchases/{purchase.id}/download_invoice/"
    
    @staticmethod
    def generate_and_save_invoice(purchase):
        """
        Generate invoice number for a purchase (PDF is generated on-demand)
        
        Args:
            purchase: Purchase model instance
            
        Returns:
            str: URL to the invoice download endpoint, or None if generation failed
        """
        if not purchase.invoice_number:
            # Generate invoice number if it doesn't exist
            import uuid
            invoice_prefix = "INV"
            timestamp = timezone.now().strftime('%Y%m%d')
            unique_id = str(uuid.uuid4())[:8].upper()
            purchase.invoice_number = f"{invoice_prefix}-{timestamp}-{unique_id}"
            purchase.save()
        
        # Update purchase with secure receipt URL
        purchase.receipt_url = PDFInvoiceService.get_invoice_url(purchase)
        purchase.save()
        
        return purchase.receipt_url