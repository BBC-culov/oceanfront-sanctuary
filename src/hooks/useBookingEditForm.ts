// Shared form state for editing a booking (used by the customer modification
// request dialog and the admin edit dialog). Pure state/validation — each
// dialog keeps its own submit logic and markup.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { countNights } from "@/lib/nights";
import type { GuestRow } from "@/components/booking/GuestListEditor";
import { mainGuestSchema, stayDatesSchema, guestSchema, flattenZodErrors, type FieldErrors } from "@/lib/modificationValidation";

export function useBookingEditForm(open: boolean, booking: any) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestLast, setGuestLast] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gDob, setGDob] = useState("");
  const [gPob, setGPob] = useState("");
  const [gNat, setGNat] = useState("");
  const [gIdType, setGIdType] = useState("id_card");
  const [gIdNum, setGIdNum] = useState("");
  const [gIdIss, setGIdIss] = useState("");
  const [gIdExp, setGIdExp] = useState("");
  const [flightOut, setFlightOut] = useState("");
  const [flightRet, setFlightRet] = useState("");
  const [airline, setAirline] = useState("");
  const [arrTime, setArrTime] = useState("");
  const [depTime, setDepTime] = useState("");
  const [noTransfer, setNoTransfer] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedSvcIds, setSelectedSvcIds] = useState<string[]>([]);
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [editGuests, setEditGuests] = useState(false);

  useEffect(() => {
    if (!open || !booking) return;
    setErrors({});
    setCheckIn(booking.check_in ?? "");
    setCheckOut(booking.check_out ?? "");
    setGuestName(booking.guest_name ?? "");
    setGuestLast(booking.guest_last_name ?? "");
    setGuestEmail(booking.guest_email ?? "");
    setPhone(booking.guest_phone ?? "");
    setGDob(booking.guest_date_of_birth ?? "");
    setGPob(booking.guest_place_of_birth ?? "");
    setGNat(booking.guest_nationality ?? "");
    setGIdType(booking.guest_id_type ?? "id_card");
    setGIdNum(booking.guest_id_card_number ?? "");
    setGIdIss(booking.guest_id_card_issued ?? "");
    setGIdExp(booking.guest_id_card_expiry ?? "");
    setFlightOut(booking.flight_outbound ?? "");
    setFlightRet(booking.flight_return ?? "");
    setAirline(booking.airline ?? "");
    setArrTime(booking.arrival_time ?? "");
    setDepTime(booking.departure_time ?? "");
    setNoTransfer(!!booking.no_transfer);
    setNotes(booking.notes ?? "");
    setSelectedSvcIds(
      Array.isArray(booking.selected_services)
        ? booking.selected_services.map((s: any) => (typeof s === "string" ? s : s?.id)).filter(Boolean)
        : []
    );
    setEditGuests(false);
    (async () => {
      const { data } = await supabase
        .from("booking_guests")
        .select("first_name,last_name,date_of_birth,nationality,id_type,id_card_number,id_card_issued,id_card_expiry")
        .eq("booking_id", booking.id);
      setGuests(
        (data ?? []).map((g: any) => ({
          first_name: g.first_name ?? "",
          last_name: g.last_name ?? "",
          date_of_birth: g.date_of_birth ?? "",
          nationality: g.nationality ?? "",
          id_type: g.id_type ?? "id_card",
          id_card_number: g.id_card_number ?? "",
          id_card_issued: g.id_card_issued ?? "",
          id_card_expiry: g.id_card_expiry ?? "",
        }))
      );
    })();
  }, [open, booking]);

  const nights = countNights(checkIn, checkOut);

  const toggleService = (id: string) =>
    setSelectedSvcIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  /** Validates dates, optionally the main guest, and (if editing) additional guests. */
  const validate = (opts: { includeMainGuest: boolean }): boolean => {
    const errs: FieldErrors = {};
    const dRes = stayDatesSchema.safeParse({ check_in: checkIn, check_out: checkOut });
    if (!dRes.success) Object.assign(errs, flattenZodErrors(dRes.error));
    if (opts.includeMainGuest) {
      const mRes = mainGuestSchema.safeParse({
        guest_name: guestName, guest_last_name: guestLast, guest_email: guestEmail, guest_phone: phone,
        guest_date_of_birth: gDob, guest_place_of_birth: gPob, guest_nationality: gNat,
        guest_id_type: gIdType as any, guest_id_card_number: gIdNum,
        guest_id_card_issued: gIdIss, guest_id_card_expiry: gIdExp,
      });
      if (!mRes.success) Object.assign(errs, flattenZodErrors(mRes.error));
    }
    if (editGuests) {
      guests.forEach((g, idx) => {
        const r = guestSchema.safeParse(g);
        if (!r.success) {
          const fl = flattenZodErrors(r.error);
          for (const k of Object.keys(fl)) errs[`guest_${idx}_${k}`] = fl[k];
        }
      });
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /** Main-guest identity fields as sent to the server (empty -> null). */
  const mainGuestIdentityChanges = () => ({
    guest_date_of_birth: gDob || null,
    guest_place_of_birth: gPob || null,
    guest_nationality: gNat || null,
    guest_id_type: gIdType,
    guest_id_card_number: gIdNum || null,
    guest_id_card_issued: gIdIss || null,
    guest_id_card_expiry: gIdExp || null,
  });

  return {
    errors, checkIn, setCheckIn, checkOut, setCheckOut,
    guestName, setGuestName, guestLast, setGuestLast, guestEmail, setGuestEmail, phone, setPhone,
    gDob, setGDob, gPob, setGPob, gNat, setGNat, gIdType, setGIdType, gIdNum, setGIdNum,
    gIdIss, setGIdIss, gIdExp, setGIdExp,
    flightOut, setFlightOut, flightRet, setFlightRet, airline, setAirline,
    arrTime, setArrTime, depTime, setDepTime, noTransfer, setNoTransfer, notes, setNotes,
    selectedSvcIds, toggleService, guests, setGuests, editGuests, setEditGuests,
    nights, validate, mainGuestIdentityChanges,
  };
}
