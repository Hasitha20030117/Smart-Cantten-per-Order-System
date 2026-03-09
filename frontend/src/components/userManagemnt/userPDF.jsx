// pdfTemplate.js
import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * Utility: Load image as Base64 (works for local / public folder images)
 */
const getBase64Image = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png")); // PNG = better transparency
    };
    img.onerror = reject;
  });

/**
 * Generate Users PDF report with logo, header, styled table & footer
 * @param {Array} users - Array of user objects
 */
export const generateUsersPDF = async (users) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1️⃣ Try load logo from public folder
  let logoBase64 = null;
  try {
    logoBase64 = await getBase64Image("/images/logo2.jpg"); // put inside public/images/
  } catch (e) {
    console.warn("Logo not found, skipping logo in PDF.");
  }

  // 2️⃣ Logo
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", pageWidth / 2 - 23, 8, 46, 23);
  }

  // 3️⃣ Company Details
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Yong Smart (Pvt) LTD", pageWidth / 2, 38, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    "281/A Cemetery Road, Sea Road, Matara, Sri Lanka",
    pageWidth / 2,
    44,
    { align: "center" }
  );
  doc.text("Contact: +94 123 456 789", pageWidth / 2, 50, {
    align: "center",
  });

  // 4️⃣ Report Title
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("User Management Report", pageWidth / 2, 62, { align: "center" });

  // Line
  doc.setLineWidth(0.5);
  doc.line(20, 67, pageWidth - 20, 67);

  // 5️⃣ Table Data
  const tableColumn = [
    "First Name",
    "Last Name",
    "Address",
    "Phone",
    "Email",
    "Role",
  ];
  const tableRows = users.map((u) => [
    u.firstName || "",
    u.lastName || "",
    u.address || "",
    u.phoneNumber || "",
    u.email || "",
    u.role || "",
  ]);

  // 6️⃣ AutoTable with alternating row colors
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 72,
    theme: "grid",
    styles: {
      fontSize: 9,
      halign: "center",
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [255, 215, 0], // gold/yellow
      textColor: [0, 0, 0],
      halign: "center",
    },
    bodyStyles: { fillColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [255, 250, 205] }, // light yellow
    margin: { left: 15, right: 15 },
    didDrawPage: (data) => {
      // Footer (auto applies on every page)
      const pageCount = doc.internal.getNumberOfPages();
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;

      doc.setFontSize(9);
      doc.setTextColor(100);

      // Footer line
      doc.setDrawColor(200);
      doc.setLineWidth(0.5);
      doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

      // Page number
      doc.text(
        `Page ${currentPage} of ${pageCount}`,
        pageWidth - 20,
        pageHeight - 10,
        { align: "right" }
      );

      // Date
      const today = new Date().toLocaleDateString();
      doc.text(`Generated on: ${today}`, 20, pageHeight - 10, {
        align: "left",
      });
    },
  });

  return doc;
};
