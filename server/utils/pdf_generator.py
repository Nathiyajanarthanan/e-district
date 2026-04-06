from fpdf import FPDF
from datetime import datetime

class CertificatePDF(FPDF):
    def header(self):
        # Draw a beautiful double border
        self.set_line_width(1)
        self.rect(5, 5, 200, 287)
        self.set_line_width(0.3)
        self.rect(8, 8, 194, 281)
        
        # Logo placeholder or Title
        self.set_font('helvetica', 'B', 24)
        self.set_text_color(22, 101, 52) # Dark Green
        self.cell(0, 30, 'E-DISTRICT GOVERNMENT PORTAL', align='C', new_x="LMARGIN", new_y="NEXT")
        self.set_line_width(0.5)
        self.set_draw_color(22, 101, 52)
        self.line(40, 40, 170, 40)
        self.ln(10)

def generate_certificate(applicant_name, service_name, app_id):
    pdf = CertificatePDF()
    pdf.add_page()
    
    # Title
    pdf.set_font('helvetica', 'B', 22)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 20, f'OFFICIAL {service_name.upper()}', align='C', new_x="LMARGIN", new_y="NEXT")
    pdf.ln(15)
    
    # Body
    pdf.set_font('helvetica', '', 14)
    text = (f"This is to officially certify that {applicant_name} has successfully "
            f"applied for and been granted the {service_name} by the e-District Administration.")
    pdf.multi_cell(0, 10, text, align='C')
    pdf.ln(20)
    
    # Details
    pdf.set_font('helvetica', 'B', 12)
    pdf.cell(0, 10, f"Application Reference Number: #{app_id}", align='C', new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 10, f"Date of Issue: {datetime.now().strftime('%B %d, %Y')}", align='C', new_x="LMARGIN", new_y="NEXT")
    
    pdf.ln(40)
    
    # Signatures
    pdf.set_font('helvetica', 'I', 12)
    pdf.cell(90, 10, "_______________________", align='C')
    pdf.cell(0, 10, "_______________________", align='C', new_x="LMARGIN", new_y="NEXT")
    pdf.cell(90, 10, "Applicant Signature", align='C')
    pdf.cell(0, 10, "Issuing Authority", align='C', new_x="LMARGIN", new_y="NEXT")
    
    # Generate watermark
    pdf.set_text_color(200, 200, 200)
    pdf.set_font('helvetica', 'B', 50)
    pdf.text(35, 180, "AUTHORIZED DOCUMENT")
    
    # Output to bytearray
    return pdf.output()
