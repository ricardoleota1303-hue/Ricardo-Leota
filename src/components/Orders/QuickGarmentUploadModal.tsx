import React, { useState, useRef, useEffect } from 'react';
import { Order, OrderReferenceImage, OrderItem } from '../../types';
import { GARMENT_GENDER_INFO } from '../../utils/formatters';
import { 
  X, 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  Trash2, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  FileText,
  Tag
} from 'lucide-react';

interface QuickGarmentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  initialGarmentItemId?: string;
  onSaveImages: (newImages: OrderReferenceImage[]) => void;
  currentUserName: string;
}

interface StagedFile {
  id: string;
  dataUrl: string;
  fileName: string;
  fileSizeBytes: number;
}

export const QuickGarmentUploadModal: React.FC<QuickGarmentUploadModalProps> = ({
  isOpen,
  onClose,
  order,
  initialGarmentItemId = 'general',
  onSaveImages,
  currentUserName,
}) => {
  const [selectedGarmentItemId, setSelectedGarmentItemId] = useState<string>(initialGarmentItemId);
  const [imageNotes, setImageNotes] = useState<string>('');
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync initialGarmentItemId whenever modal opens or changes
  useEffect(() => {
    if (isOpen) {
      setSelectedGarmentItemId(initialGarmentItemId || 'general');
      setImageNotes('');
      setStagedFiles([]);
      setErrorMessage('');
    }
  }, [isOpen, initialGarmentItemId]);

  // Clipboard paste listener to allow pasting images directly from WhatsApp or screenshot
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        processFiles(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  // Compress image before saving
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

  const processFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    const validImages = list.filter(f => f.type.startsWith('image/'));

    if (validImages.length === 0) {
      setErrorMessage('Por favor selecciona únicamente archivos de imagen (PNG, JPG, WEBP).');
      return;
    }

    setErrorMessage('');
    setIsProcessing(true);

    try {
      const newStaged: StagedFile[] = [];
      for (const file of validImages) {
        const dataUrl = await compressImage(file);
        newStaged.push({
          id: `staged-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          dataUrl,
          fileName: file.name || `foto_muestra_${Date.now()}`,
          fileSizeBytes: file.size,
        });
      }

      setStagedFiles(prev => [...prev, ...newStaged]);
    } catch (err) {
      console.error('Error procesando imagen:', err);
      setErrorMessage('Ocurrió un error al procesar las imágenes. Intenta con archivos más ligeros.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeStagedFile = (id: string) => {
    setStagedFiles(prev => prev.filter(f => f.id !== id));
  };

  const selectedGarment: OrderItem | undefined = order.items.find(
    it => it.id === selectedGarmentItemId
  );

  const handleSave = () => {
    if (stagedFiles.length === 0) {
      setErrorMessage('Debes adjuntar al menos una imagen de referencia.');
      return;
    }

    let garmentItemName: string | undefined = undefined;
    if (selectedGarment) {
      garmentItemName = `${selectedGarment.productName} (Talla ${selectedGarment.size} - ${selectedGarment.color})`;
    }

    const newImages: OrderReferenceImage[] = stagedFiles.map(staged => ({
      id: `ref-img-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      url: staged.dataUrl,
      name: staged.fileName,
      uploadedAt: new Date().toISOString(),
      uploadedByName: currentUserName,
      garmentItemId: selectedGarmentItemId === 'general' ? undefined : selectedGarmentItemId,
      garmentItemName,
      notes: imageNotes.trim() || undefined,
      fileSizeBytes: staged.fileSizeBytes,
    }));

    onSaveImages(newImages);
    onClose();
  };

  const quickNotesSuggestions = [
    'Muestra de bordado y posición',
    'Tono de tela solicitado por cliente',
    'Detalle de bolsillo y cremallera',
    'Cinta reflectiva reglamentaria',
    'Muestra física entregada por cliente'
  ];

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col my-auto max-h-[96vh] sm:max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <span>Subir Fotos de Referencia</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Pedido <strong className="text-amber-400 font-mono">{order.orderNumber}</strong> • {order.deliveryInfo.companyName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Garment Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>¿A qué prenda del pedido corresponde esta referencia?</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Obligatorio</span>
            </label>

            <select
              value={selectedGarmentItemId}
              onChange={(e) => setSelectedGarmentItemId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-2xs"
            >
              <option value="general">⭐ Toda la Orden (Referencia General de Diseño / Tela)</option>
              {order.items.map((item) => (
                <option key={item.id} value={item.id}>
                  [{item.productCode}] {item.productName} — Corte {item.gender || 'unisex'} (Talla {item.size} - {item.color})
                </option>
              ))}
            </select>

            {/* Display Selected Garment Banner */}
            {selectedGarment && (
              <div className="mt-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs">
                <div className="p-2 rounded-lg bg-white border border-amber-200 shrink-0 text-amber-700 shadow-2xs">
                  <Tag className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-slate-900">{selectedGarment.productName}</span>
                    <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-amber-200">
                      {selectedGarment.productCode}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                    {selectedGarment.gender && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${GARMENT_GENDER_INFO[selectedGarment.gender]?.badge || ''}`}>
                        {GARMENT_GENDER_INFO[selectedGarment.gender]?.shortLabel || selectedGarment.gender}
                      </span>
                    )}
                    <span className="font-semibold text-slate-800">Talla {selectedGarment.size}</span>
                    <span className="flex items-center gap-1">
                      {selectedGarment.colorHex && (
                        <span 
                          className="w-3 h-3 rounded-full border border-slate-300 inline-block shadow-2xs"
                          style={{ backgroundColor: selectedGarment.colorHex }}
                        />
                      )}
                      <span>{selectedGarment.color}</span>
                    </span>
                    <span>• <strong>{selectedGarment.quantity} unds</strong></span>
                  </div>
                  {selectedGarment.detailedDescription && (
                    <p className="text-[11px] text-amber-900 bg-white p-2 rounded border border-amber-200 italic mt-1">
                      "{selectedGarment.detailedDescription}"
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Upload Dropzone */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>Adjuntar Imágenes o Fotos de Muestra</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">JPG, PNG o WEBP</span>
            </label>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                isDragging 
                  ? 'border-amber-500 bg-amber-50/70 scale-[0.99]' 
                  : 'border-slate-300 hover:border-amber-400 bg-slate-50/60'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Arrastra tus fotos de referencia aquí
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    o usa los botones para seleccionar desde el equipo o tomar una foto con la cámara
                  </p>
                </div>

                {/* Action buttons inside dropzone */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Seleccionar Archivos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Tomar Foto con Cámara</span>
                  </button>
                </div>

                <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-1">
                  <span>💡 Tip: También puedes pegar directamente imágenes del portapapeles con</span>
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-slate-700">Ctrl + V</kbd>
                </div>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && processFiles(e.target.files)}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => e.target.files && processFiles(e.target.files)}
                className="hidden"
              />
            </div>
          </div>

          {/* Staged Images Preview Grid */}
          {stagedFiles.length > 0 && (
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-4 h-4" />
                  <span>Fotos listas para adjuntar ({stagedFiles.length}):</span>
                </span>
                <button
                  type="button"
                  onClick={() => setStagedFiles([])}
                  className="text-[11px] text-rose-600 hover:underline font-normal cursor-pointer"
                >
                  Quitar todas
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {stagedFiles.map((staged) => (
                  <div 
                    key={staged.id}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-slate-300 bg-white shadow-2xs"
                  >
                    <img
                      src={staged.dataUrl}
                      alt={staged.fileName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                      <button
                        type="button"
                        onClick={() => removeStagedFile(staged.id)}
                        className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes or Technical Specifications */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>Nota, Instrucción o Especificación Técnica de la Muestra:</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Opcional</span>
            </label>

            <textarea
              rows={2}
              value={imageNotes}
              onChange={(e) => setImageNotes(e.target.value)}
              placeholder="Ej: Posición del bordado a 7 cm del hombro izquierdo, tono azul petróleo según muestra..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 shadow-2xs"
            />

            {/* Quick chips suggestions */}
            <div className="mt-1.5 flex flex-wrap gap-1">
              {quickNotesSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setImageNotes(prev => prev ? `${prev} • ${suggestion}` : suggestion)}
                  className="px-2 py-0.5 text-[10px] rounded-md bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 transition-colors cursor-pointer"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Processing / Error Feedback */}
          {isProcessing && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin shrink-0" />
              <span>Optimizando y procesando fotos de la prenda...</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing || stagedFiles.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            <span>Guardar {stagedFiles.length > 0 ? `${stagedFiles.length} Foto(s)` : 'Fotos'} en el Pedido</span>
          </button>
        </div>
      </div>
    </div>
  );
};
