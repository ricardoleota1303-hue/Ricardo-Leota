import React, { useState, useRef, useEffect } from 'react';
import { Order, OrderItem, OrderReferenceImage } from '../../types';
import { formatDate } from '../../utils/formatters';
import { 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Eye, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Link as LinkIcon, 
  Camera, 
  Check, 
  AlertCircle,
  FileImage,
  Tag,
  RotateCw,
  Filter,
  Sparkles
} from 'lucide-react';

interface OrderReferenceImagesGalleryProps {
  order: Order;
  onUpdateOrder: (updatedOrder: Order) => void;
  canEdit: boolean;
  currentUserName: string;
  onOpenQuickUpload?: (garmentItemId?: string) => void;
}

export const OrderReferenceImagesGallery: React.FC<OrderReferenceImagesGalleryProps> = ({
  order,
  onUpdateOrder,
  canEdit,
  currentUserName,
  onOpenQuickUpload,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedGarmentItemId, setSelectedGarmentItemId] = useState<string>('general');
  const [imageNotes, setImageNotes] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [previewLightboxIndex, setPreviewLightboxIndex] = useState<number | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);
  const [lightboxRotation, setLightboxRotation] = useState<number>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [filterGarmentId, setFilterGarmentId] = useState<string>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const referenceImages: OrderReferenceImage[] = order.referenceImages || [];

  // Helper to compress image before converting to base64
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleProcessFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list || list.length === 0) return;
    setUploadError('');
    setIsUploading(true);

    try {
      const newImages: OrderReferenceImage[] = [];

      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        if (!file.type.startsWith('image/')) {
          continue;
        }

        const base64Url = await compressImage(file);
        
        let garmentItemName: string | undefined = undefined;
        if (selectedGarmentItemId !== 'general') {
          const match = order.items.find(it => it.id === selectedGarmentItemId);
          if (match) {
            garmentItemName = `${match.productName} (Talla ${match.size} - ${match.color})`;
          }
        }

        const newImg: OrderReferenceImage = {
          id: `ref-img-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          url: base64Url,
          name: file.name || `Foto_Referencia_${Date.now()}`,
          uploadedAt: new Date().toISOString(),
          uploadedByName: currentUserName,
          garmentItemId: selectedGarmentItemId === 'general' ? undefined : selectedGarmentItemId,
          garmentItemName: garmentItemName,
          notes: imageNotes.trim() || undefined,
          fileSizeBytes: file.size,
        };

        newImages.push(newImg);
      }

      if (newImages.length === 0) {
        setUploadError('Por favor selecciona archivos de imagen válidos (PNG, JPG, WEBP).');
        setIsUploading(false);
        return;
      }

      const updatedOrder: Order = {
        ...order,
        referenceImages: [...referenceImages, ...newImages],
      };

      onUpdateOrder(updatedOrder);
      setImageNotes('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    } catch (err) {
      console.error('Error procesando imagen de referencia:', err);
      setUploadError('Ocurrió un error al procesar la imagen. Intenta con un archivo más ligero.');
    } finally {
      setIsUploading(false);
    }
  };

  // Add from URL
  const handleAddFromUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    let garmentItemName: string | undefined = undefined;
    if (selectedGarmentItemId !== 'general') {
      const match = order.items.find(it => it.id === selectedGarmentItemId);
      if (match) {
        garmentItemName = `${match.productName} (Talla ${match.size} - ${match.color})`;
      }
    }

    const newImg: OrderReferenceImage = {
      id: `ref-img-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      url: urlInput.trim(),
      name: `Imagen_Web_${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      uploadedByName: currentUserName,
      garmentItemId: selectedGarmentItemId === 'general' ? undefined : selectedGarmentItemId,
      garmentItemName: garmentItemName,
      notes: imageNotes.trim() || undefined,
    };

    const updatedOrder: Order = {
      ...order,
      referenceImages: [...referenceImages, newImg],
    };

    onUpdateOrder(updatedOrder);
    setUrlInput('');
    setImageNotes('');
    setShowUrlModal(false);
  };

  const handleDeleteImage = (imageId: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta imagen de referencia de la prenda?')) {
      return;
    }
    const updatedImages = referenceImages.filter(img => img.id !== imageId);
    onUpdateOrder({
      ...order,
      referenceImages: updatedImages,
    });
    if (previewLightboxIndex !== null) {
      setPreviewLightboxIndex(null);
    }
  };

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  // Filtered list of images for display
  const filteredImages = referenceImages.filter(img => {
    if (filterGarmentId === 'all') return true;
    if (filterGarmentId === 'general') return !img.garmentItemId;
    return img.garmentItemId === filterGarmentId;
  });

  const activeLightboxImage = previewLightboxIndex !== null ? filteredImages[previewLightboxIndex] : null;

  return (
    <div id="seccion-fotos-referencia" className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs space-y-4 p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-600" />
            <span>Imágenes & Muestras de Referencia de la Prenda ({referenceImages.length})</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Fotos de muestra física, bocetos de diseño, telas, acabados y detalles de confección para el taller
          </p>
        </div>

        {canEdit && (
          <div className="flex flex-wrap items-center gap-2">
            {onOpenQuickUpload && (
              <button
                type="button"
                onClick={() => onOpenQuickUpload(selectedGarmentItemId)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>+ Subir Fotos de Muestra</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Tomar foto con la cámara del dispositivo"
            >
              <Camera className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Cámara</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUrlModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Añadir por enlace web"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pegar URL</span>
            </button>
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => e.target.files && handleProcessFiles(e.target.files)}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => e.target.files && handleProcessFiles(e.target.files)}
        className="hidden"
      />

      {/* Uploader Dropzone and Controls (Visible when editing) */}
      {canEdit && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-4 transition-all ${
            dragActive
              ? 'border-amber-500 bg-amber-50/70 scale-[0.99]'
              : 'border-slate-200 hover:border-amber-300 bg-slate-50/50'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Drop info */}
            <div className="md:col-span-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
                <Camera className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-800">Arrastra fotos aquí o selecciona</div>
                <div className="text-[11px] text-slate-500">Muestras de bordado, tela o prenda real</div>
              </div>
            </div>

            {/* Associate with specific garment item */}
            <div className="md:col-span-4">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Asociar a Prenda Específica del Pedido:
              </label>
              <select
                value={selectedGarmentItemId}
                onChange={(e) => setSelectedGarmentItemId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500"
              >
                <option value="general">⭐ Toda la Orden (Referencia General)</option>
                {order.items.map((item, idx) => (
                  <option key={item.id || idx} value={item.id}>
                    [{item.productCode}] {item.productName} — Talla {item.size} ({item.color})
                  </option>
                ))}
              </select>
            </div>

            {/* Note/specification input */}
            <div className="md:col-span-4 flex gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nota o Especificación de la Muestra:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Posición del bordado o bolsillo..."
                  value={imageNotes}
                  onChange={(e) => setImageNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="self-end">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Subir</span>
                </button>
              </div>
            </div>
          </div>

          {uploadError && (
            <div className="mt-2 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {isUploading && (
            <div className="mt-2 text-xs text-amber-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
              <span>Procesando y optimizando imagen para el pedido...</span>
            </div>
          )}
        </div>
      )}

      {/* URL Modal Popup */}
      {showUrlModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-amber-600" />
                <span>Agregar Imagen de Referencia por URL</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowUrlModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFromUrl} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enlace directo de la imagen (JPG, PNG, WEBP) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://ejemplo.com/fotos-confeccion/muestra-overol.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asociar a Prenda:
                </label>
                <select
                  value={selectedGarmentItemId}
                  onChange={(e) => setSelectedGarmentItemId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                >
                  <option value="general">⭐ Toda la Orden (Referencia General)</option>
                  {order.items.map((item, idx) => (
                    <option key={item.id || idx} value={item.id}>
                      [{item.productCode}] {item.productName} ({item.size})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nota o Especificación:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Muestra de cuello camisero con vivos azules"
                  value={imageNotes}
                  onChange={(e) => setImageNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUrlModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg"
                >
                  Guardar Referencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Tabs by Garment */}
      {referenceImages.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2">
          <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Filtrar:</span>
          </span>

          <button
            type="button"
            onClick={() => setFilterGarmentId('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filterGarmentId === 'all'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({referenceImages.length})
          </button>

          {/* Garment item tabs */}
          {order.items.map((it) => {
            const count = referenceImages.filter(img => img.garmentItemId === it.id).length;
            if (count === 0 && filterGarmentId !== it.id) return null;
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => setFilterGarmentId(it.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterGarmentId === it.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="truncate max-w-[120px]">{it.productName}</span>
                <span className="text-[10px] px-1 rounded-full bg-white/70 font-mono font-bold">
                  {count}
                </span>
              </button>
            );
          })}

          {/* General reference tab */}
          {referenceImages.some(img => !img.garmentItemId) && (
            <button
              type="button"
              onClick={() => setFilterGarmentId('general')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterGarmentId === 'general'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Generales ({referenceImages.filter(img => !img.garmentItemId).length})
            </button>
          )}
        </div>
      )}

      {/* Images Grid */}
      {referenceImages.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2">
          <FileImage className="w-8 h-8 text-slate-300 mx-auto" />
          <div className="text-xs font-semibold text-slate-700">
            No se han subido imágenes de referencia aún para este pedido
          </div>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            Puedes cargar fotos de muestras físicas de tela, diseños de bordado aprobados o fotos del uniforme entregado anteriormente para asegurar que el taller confeccione la prenda exacta.
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={() => onOpenQuickUpload ? onOpenQuickUpload('general') : fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold hover:bg-amber-100 cursor-pointer mt-2"
            >
              <Upload className="w-3.5 h-3.5 text-amber-600" />
              <span>Seleccionar Fotos desde el Dispositivo</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {filteredImages.map((img, idx) => (
            <div
              key={img.id || idx}
              className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Image Thumbnail Container */}
              <div 
                className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer flex items-center justify-center"
                onClick={() => {
                  setPreviewLightboxIndex(idx);
                  setLightboxZoom(1);
                  setLightboxRotation(0);
                }}
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />

                {/* Hover overlay with zoom button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="p-2 rounded-full bg-white/90 text-slate-900 shadow-sm hover:bg-white hover:scale-110 transition-transform">
                    <Eye className="w-4 h-4" />
                  </span>
                </div>

                {/* Garment item badge on top */}
                <div className="absolute top-2 left-2 right-2 flex justify-between items-start pointer-events-none">
                  {img.garmentItemName ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950 shadow-xs truncate max-w-[85%]">
                      {img.garmentItemName.split('(')[0]}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 text-white shadow-xs">
                      General
                    </span>
                  )}
                </div>
              </div>

              {/* Caption & Info */}
              <div className="p-2.5 space-y-1.5 text-xs bg-white border-t border-slate-100">
                {img.notes ? (
                  <p className="text-[11px] font-medium text-slate-800 line-clamp-2 leading-snug" title={img.notes}>
                    "{img.notes}"
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">Muestra sin observaciones adicionales</p>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-50">
                  <span className="truncate max-w-[120px]" title={img.uploadedByName}>
                    Por: {img.uploadedByName}
                  </span>
                  <span>{formatDate(img.uploadedAt).split(' ')[0]}</span>
                </div>

                {/* Card actions */}
                <div className="flex items-center justify-end gap-1 pt-1">
                  <a
                    href={img.url}
                    download={img.name || 'muestra-prenda.jpg'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Descargar imagen"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="p-1 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Eliminar imagen de referencia"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Printable Appendix for Delivery & Workshop Note */}
      {referenceImages.length > 0 && (
        <div className="hidden print:block pt-4 border-t border-slate-300">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
            Anexo Técnico: Muestras Visuales & Fotos de Referencia de Confección ({referenceImages.length})
          </div>
          <div className="grid grid-cols-4 gap-3">
            {referenceImages.map((img, idx) => (
              <div key={idx} className="border border-slate-300 rounded p-1.5 text-[9px] break-inside-avoid">
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-24 object-contain bg-slate-50 mb-1 rounded"
                />
                <div className="font-bold text-slate-800 truncate">
                  {img.garmentItemName || 'Referencia General'}
                </div>
                {img.notes && (
                  <div className="text-slate-600 italic leading-tight">
                    {img.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {activeLightboxImage && previewLightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col justify-between p-4 animate-in fade-in duration-150">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="space-y-0.5">
              <div className="font-bold text-sm flex items-center gap-2">
                <span>{activeLightboxImage.name}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
                  {previewLightboxIndex + 1} de {filteredImages.length}
                </span>
              </div>
              <div className="text-xs text-slate-300">
                {activeLightboxImage.garmentItemName ? `Prenda: ${activeLightboxImage.garmentItemName}` : 'Referencia General del Pedido'} • Subida por {activeLightboxImage.uploadedByName} ({formatDate(activeLightboxImage.uploadedAt)})
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxRotation(prev => (prev + 90) % 360)}
                className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
                title="Girar imagen 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxZoom(prev => Math.min(prev + 0.25, 3))}
                className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
                title="Ampliar zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxZoom(prev => Math.max(prev - 0.25, 0.5))}
                className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
                title="Reducir zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <a
                href={activeLightboxImage.url}
                download={activeLightboxImage.name || 'muestra-prenda.jpg'}
                className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
                title="Descargar imagen"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => setPreviewLightboxIndex(null)}
                className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors cursor-pointer"
                title="Cerrar visor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Image View */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden my-4 select-none">
            {/* Left Nav */}
            {filteredImages.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setPreviewLightboxIndex((previewLightboxIndex - 1 + filteredImages.length) % filteredImages.length);
                  setLightboxZoom(1);
                  setLightboxRotation(0);
                }}
                className="absolute left-2 p-3 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors z-10 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div className="overflow-auto max-w-full max-h-[75vh] flex items-center justify-center">
              <img
                src={activeLightboxImage.url}
                alt={activeLightboxImage.name}
                style={{ 
                  transform: `scale(${lightboxZoom}) rotate(${lightboxRotation}deg)`, 
                  transition: 'transform 0.15s ease-out' 
                }}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Right Nav */}
            {filteredImages.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setPreviewLightboxIndex((previewLightboxIndex + 1) % filteredImages.length);
                  setLightboxZoom(1);
                  setLightboxRotation(0);
                }}
                className="absolute right-2 p-3 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors z-10 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Notes & Details */}
          {activeLightboxImage.notes && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 max-w-2xl mx-auto text-center text-xs text-amber-200">
              <strong className="text-white">Instrucción / Detalle de la Muestra: </strong>
              {activeLightboxImage.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
