import type { ProjectPayload } from "@/lib/dataTypes";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useProjectMediaUpload } from "@/hooks/useProjectMediaUpload";
import { MAX_IMAGE_MB, MAX_VIDEO_MB, MAX_BROCHURE_MB, MAX_IMAGES, ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, ALLOWED_BROCHURE_TYPES, projectSchema, empty, slugify } from "@/lib/projectForm";
import { useAdminProjects, type ProjectRow } from "@/hooks/useAdminProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, X, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const AdminProgetti = () => {
  const { projects, loading, isSlugTaken, saveProject, togglePublished, deleteProject } = useAdminProjects();
  const [editing, setEditing] = useState<Partial<ProjectRow> | null>(null);
  const [saving, setSaving] = useState(false);
  const [servicesText, setServicesText] = useState("");
  const { uploadingImages, uploadingVideo, uploadingBrochure, handleUploadImages, handleUploadBrochure, handleUploadVideo } = useProjectMediaUpload(editing, setEditing);

  const openNew = () => {
    setEditing({ ...empty });
    setServicesText("");
  };

  const openEdit = (p: ProjectRow) => {
    setEditing({ ...p });
    setServicesText((p.included_services ?? []).join("\n"));
  };

  const close = () => {
    setEditing(null);
    setServicesText("");
  };

  const removeImage = (i: number) => {
    if (!editing) return;
    const next = [...(editing.images ?? [])];
    next.splice(i, 1);
    setEditing({ ...editing, images: next });
  };

  const save = async () => {
    if (!editing) return;
    const title = (editing.title ?? "").trim();
    const slug = ((editing.slug ?? "").trim() || slugify(title));

    const candidate = {
      title,
      slug,
      subtitle: editing.subtitle ?? null,
      description: editing.description ?? null,
      price: editing.price ?? null,
      price_label: editing.price_label ?? null,
      address: editing.address ?? null,
      latitude: editing.latitude ?? null,
      longitude: editing.longitude ?? null,
      google_maps_url: editing.google_maps_url ?? null,
      apple_maps_url: editing.apple_maps_url ?? null,
      contact_email: editing.contact_email ?? null,
      contact_phone: editing.contact_phone ?? null,
      purchase_info: editing.purchase_info ?? null,
    };

    const parsed = projectSchema.safeParse(candidate);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dati non validi");
      return;
    }

    const services = servicesText.split("\n").map((s) => s.trim()).filter(Boolean);
    if (services.some((s) => s.length > 120)) {
      toast.error("Ogni servizio deve essere inferiore a 120 caratteri");
      return;
    }
    if (services.length > 30) {
      toast.error("Max 30 servizi inclusi");
      return;
    }

    // Slug uniqueness check
    if (await isSlugTaken(slug, editing.id)) {
      toast.error("Slug già in uso da un altro progetto");
      return;
    }

    const payload: ProjectPayload = {
      ...parsed.data,
      title: parsed.data.title as string,
      slug: parsed.data.slug as string,
      subtitle: parsed.data.subtitle || null,
      description: parsed.data.description || null,
      price_label: parsed.data.price_label || null,
      address: parsed.data.address || null,
      google_maps_url: parsed.data.google_maps_url || null,
      apple_maps_url: parsed.data.apple_maps_url || null,
      contact_email: parsed.data.contact_email || null,
      contact_phone: parsed.data.contact_phone || null,
      purchase_info: parsed.data.purchase_info || null,
      images: editing.images ?? [],
      video_url: editing.video_url || null,
      brochure_url: editing.brochure_url || null,
      included_services: services,
      published: !!editing.published,
      display_order: editing.display_order ?? projects.length,
    };

    setSaving(true);
    const ok = await saveProject(payload, editing.id);
    setSaving(false);
    if (ok) close();
  };

  const togglePublish = (p: ProjectRow) => togglePublished(p);

  const remove = async (p: ProjectRow) => {
    if (!confirm(`Eliminare "${p.title}"?`)) return;
    await deleteProject(p);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl mb-1">Progetti Compra</h1>
          <p className="font-sans text-sm text-muted-foreground">
            Gestisci i progetti immobiliari in vendita
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" /> Nuovo progetto
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Caricamento…</div>
      ) : projects.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center rounded-sm">
          <p className="font-sans text-sm text-muted-foreground mb-4">
            Nessun progetto ancora. Crea il primo.
          </p>
          <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Nuovo progetto</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div key={p.id} className="border border-border rounded-sm overflow-hidden bg-card">
              <div className="aspect-video bg-muted">
                {p.images[0] && <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-serif text-lg">{p.title}</h3>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${p.published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {p.published ? "Pubblicato" : "Bozza"}
                  </span>
                </div>
                {p.subtitle && <p className="text-xs text-muted-foreground mb-3">{p.subtitle}</p>}
                <div className="flex items-center gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                    <Pencil className="w-3 h-3 mr-1" /> Modifica
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => togglePublish(p)}>
                    {p.published ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                    {p.published ? "Nascondi" : "Pubblica"}
                  </Button>
                  <Link to={`/compra/progetti/${p.slug}`} target="_blank">
                    <Button size="sm" variant="ghost"><ExternalLink className="w-3 h-3" /></Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => remove(p)} className="text-destructive ml-auto">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Modifica progetto" : "Nuovo progetto"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Titolo *</Label>
                  <Input
                    value={editing.title ?? ""}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Slug URL</Label>
                  <Input
                    value={editing.slug ?? ""}
                    onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })}
                    placeholder="es. villa-praia-cabral"
                  />
                </div>
              </div>
              <div>
                <Label>Sottotitolo</Label>
                <Input value={editing.subtitle ?? ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} />
              </div>
              <div>
                <Label>Descrizione completa</Label>
                <Textarea rows={5} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>

              {/* Images */}
              <div>
                <Label>Galleria foto ({(editing.images ?? []).length}/{MAX_IMAGES})</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {(editing.images ?? []).map((url, i) => (
                    <div key={i} className="relative aspect-square bg-muted overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="mt-2 inline-flex items-center gap-2 cursor-pointer border border-dashed border-border px-4 py-2 text-sm">
                  {uploadingImages ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Carica immagini
                  <input type="file" accept="image/*" multiple hidden onChange={(e) => handleUploadImages(e.target.files)} />
                </label>
              </div>

              {/* Video */}
              <div>
                <Label>Video render</Label>
                {editing.video_url && (
                  <div className="mb-2">
                    <video src={editing.video_url} controls className="w-full max-h-60 bg-muted" />
                    <button onClick={() => setEditing({ ...editing, video_url: "" })} className="text-xs text-destructive mt-1">Rimuovi video</button>
                  </div>
                )}
                <label className="inline-flex items-center gap-2 cursor-pointer border border-dashed border-border px-4 py-2 text-sm">
                  {uploadingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Carica video
                  <input type="file" accept="video/*" hidden onChange={(e) => handleUploadVideo(e.target.files?.[0] ?? null)} />
                </label>
              </div>

              {/* Brochure PDF */}
              <div>
                <Label>Brochure PDF (scaricabile dagli utenti)</Label>
                {editing.brochure_url && (
                  <div className="mb-2 flex items-center gap-3 text-sm">
                    <a href={editing.brochure_url} target="_blank" rel="noreferrer" className="underline truncate">
                      Brochure caricata
                    </a>
                    <button onClick={() => setEditing({ ...editing, brochure_url: "" })} className="text-xs text-destructive">
                      Rimuovi
                    </button>
                  </div>
                )}
                <label className="inline-flex items-center gap-2 cursor-pointer border border-dashed border-border px-4 py-2 text-sm">
                  {uploadingBrochure ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Carica brochure (PDF, max {MAX_BROCHURE_MB}MB)
                  <input type="file" accept="application/pdf" hidden onChange={(e) => handleUploadBrochure(e.target.files?.[0] ?? null)} />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Prezzo (€)</Label>
                  <Input type="number" value={editing.price ?? ""} onChange={(e) => setEditing({ ...editing, price: e.target.value ? Number(e.target.value) : null })} />
                </div>
                <div>
                  <Label>Etichetta prezzo</Label>
                  <Input value={editing.price_label ?? ""} onChange={(e) => setEditing({ ...editing, price_label: e.target.value })} placeholder="A partire da" />
                </div>
              </div>

              <div>
                <Label>Indirizzo</Label>
                <Input value={editing.address ?? ""} onChange={(e) => setEditing({ ...editing, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Latitudine</Label>
                  <Input type="number" step="any" value={editing.latitude ?? ""} onChange={(e) => setEditing({ ...editing, latitude: e.target.value ? Number(e.target.value) : null })} />
                </div>
                <div>
                  <Label>Longitudine</Label>
                  <Input type="number" step="any" value={editing.longitude ?? ""} onChange={(e) => setEditing({ ...editing, longitude: e.target.value ? Number(e.target.value) : null })} />
                </div>
                <div>
                  <Label>Link Google Maps (opz.)</Label>
                  <Input value={editing.google_maps_url ?? ""} onChange={(e) => setEditing({ ...editing, google_maps_url: e.target.value })} />
                </div>
                <div>
                  <Label>Link Apple Maps (opz.)</Label>
                  <Input value={editing.apple_maps_url ?? ""} onChange={(e) => setEditing({ ...editing, apple_maps_url: e.target.value })} />
                </div>
              </div>

              <div>
                <Label>Servizi inclusi (uno per riga)</Label>
                <Textarea rows={5} value={servicesText} onChange={(e) => setServicesText(e.target.value)} placeholder={"Piscina privata\nVista oceano\nParcheggio"} />
              </div>

              <div>
                <Label>Modalità di acquisto / prenotazione</Label>
                <Textarea rows={4} value={editing.purchase_info ?? ""} onChange={(e) => setEditing({ ...editing, purchase_info: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email referente</Label>
                  <Input type="email" value={editing.contact_email ?? ""} onChange={(e) => setEditing({ ...editing, contact_email: e.target.value })} />
                </div>
                <div>
                  <Label>Telefono referente</Label>
                  <Input value={editing.contact_phone ?? ""} onChange={(e) => setEditing({ ...editing, contact_phone: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <Label>Ordine</Label>
                  <Input type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={!!editing.published} onCheckedChange={(c) => setEditing({ ...editing, published: c })} />
                  <Label>Pubblicato</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={close}>Annulla</Button>
                <Button onClick={save} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Salva
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProgetti;
