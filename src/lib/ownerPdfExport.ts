// PDF performance report for owners (jsPDF + autotable).
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoUrl from "@/assets/logo-bazhouse.png";
import { eur, loadImageDataUrl } from "@/lib/ownerOverview";
import type { OwnerOverviewMetrics } from "@/hooks/useOwnerOverviewMetrics";

type Params = Pick<OwnerOverviewMetrics,
  "periodLabel" | "kpis" | "topApartment" | "peakMonth" | "avgGuests" | "apartments" |
  "monthlySeries" | "activeBookings" | "aptNameById" | "range">;

export async function exportOwnerReportPdf({
  periodLabel, kpis, topApartment, peakMonth, avgGuests, apartments,
  monthlySeries, activeBookings, aptNameById, range,
}: Params): Promise<void> {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;

      const logo = await loadImageDataUrl(logoUrl);
      if (logo) {
        try { doc.addImage(logo, "PNG", margin, 32, 110, 36, undefined, "FAST"); } catch (err) { console.error("PDF logo error", err); }
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(20, 20, 20);
      doc.text("Report Performance", pageWidth - margin, 50, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(110, 110, 110);
      doc.text(`Periodo: ${periodLabel}`, pageWidth - margin, 66, { align: "right" });
      doc.text(
        `Generato: ${format(new Date(), "dd MMM yyyy HH:mm", { locale: it })}`,
        pageWidth - margin, 80, { align: "right" },
      );

      doc.setDrawColor(220, 220, 220);
      doc.line(margin, 96, pageWidth - margin, 96);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(20, 20, 20);
      doc.text("Riepilogo economico", margin, 122);

      autoTable(doc, {
        startY: 132,
        head: [["Indicatore", "Valore"]],
        body: [
          ["Prenotazioni nel periodo", String(kpis.totalBookings)],
          ["Entrate totali", eur(kpis.totalRevenue)],
          ["Pagamenti ricevuti", eur(kpis.totalReceived)],
          ["Margine stimato (netto piattaforma)", eur(kpis.margin)],
          ["Tasso pagamento", kpis.totalRevenue > 0 ? `${Math.round((kpis.totalReceived / kpis.totalRevenue) * 100)}%` : "—"],
        ],
        theme: "grid",
        headStyles: { fillColor: [20, 20, 20], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 10 },
        margin: { left: margin, right: margin },
      });

      let y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Performance generale", margin, y);

      autoTable(doc, {
        startY: y + 10,
        head: [["Metrica", "Dettaglio"]],
        body: [
          ["Appartamento più scelto", topApartment ? `${topApartment.name} (${topApartment.value} pren.)` : "—"],
          ["Periodo top", peakMonth],
          ["Ospiti medi per prenotazione", avgGuests > 0 ? avgGuests.toFixed(1) : "—"],
          ["Appartamenti gestiti", String(apartments.length)],
        ],
        theme: "grid",
        headStyles: { fillColor: [20, 20, 20], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 10 },
        margin: { left: margin, right: margin },
      });

      y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Andamento mensile", margin, y);

      autoTable(doc, {
        startY: y + 10,
        head: [["Mese", "Prenotazioni", "Entrate"]],
        body: monthlySeries.map((m) => [m.label, String(m.bookings), eur(m.revenue)]),
        theme: "striped",
        headStyles: { fillColor: [20, 20, 20], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        margin: { left: margin, right: margin },
      });

      if (activeBookings.length > 0) {
        y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
        if (y > 720) { doc.addPage(); y = 60; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text("Dettaglio prenotazioni", margin, y);

        autoTable(doc, {
          startY: y + 10,
          head: [["Codice", "Appartamento", "Check-in", "Check-out", "Stato", "Totale", "Pagato"]],
          body: activeBookings
            .slice()
            .sort((a, b) => a.check_in.localeCompare(b.check_in))
            .map((b) => [
              b.booking_code ?? "—",
              aptNameById.get(b.apartment_id) ?? "—",
              format(parseISO(b.check_in), "dd/MM/yyyy"),
              format(parseISO(b.check_out), "dd/MM/yyyy"),
              b.status,
              eur(Number(b.total_price ?? 0)),
              eur(Number(b.amount_paid ?? 0)),
            ]),
          theme: "striped",
          headStyles: { fillColor: [20, 20, 20], textColor: 255, fontSize: 9 },
          bodyStyles: { fontSize: 8 },
          margin: { left: margin, right: margin },
        });
      }

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("BAZHOUSE — Report riservato al proprietario", margin, doc.internal.pageSize.getHeight() - 24);
        doc.text(`Pagina ${i} di ${pageCount}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 24, { align: "right" });
      }

      doc.save(`bazhouse-report-${format(range.from, "yyyyMMdd")}-${format(range.to, "yyyyMMdd")}.pdf`);
}
