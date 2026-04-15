import React, { useState, useRef } from 'react';

interface ImageVariableInputProps {
  variable: {
    variableid: number;
    nombre: string;
    etiqueta: string;
    descripcion: string | null;
    tipo_dato: string;
    ejemplo: string | null;
    es_requerida: number;
  };
  value: string;
  onChange: (nombre: string, valor: string) => void;
}

const MAX_SIZE_MB = 0.5;
const TARGET_KB = 60;
const MAX_DIMENSION = 600;

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      reject(new Error(`La imagen no debe superar ${MAX_SIZE_MB} MB`));
      return;
    }
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo debe ser una imagen'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = () => reject(new Error('Error al leer el archivo'));

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onerror = () => reject(new Error('Error al cargar la imagen'));

      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('No se pudo obtener contexto canvas')); return; }
        ctx.drawImage(img, 0, 0, width, height);

        const qualities = [0.6, 0.4, 0.25, 0.15];
        let result = '';
        for (const q of qualities) {
          result = canvas.toDataURL('image/jpeg', q);
          if ((result.length * 0.75) / 1024 <= TARGET_KB) break;
        }

        if ((result.length * 0.75) / 1024 > TARGET_KB && (width > 200 || height > 200)) {
          const canvas2 = document.createElement('canvas');
          canvas2.width = Math.round(width / 2);
          canvas2.height = Math.round(height / 2);
          const ctx2 = canvas2.getContext('2d');
          ctx2?.drawImage(img, 0, 0, canvas2.width, canvas2.height);
          result = canvas2.toDataURL('image/jpeg', 0.25);
        }

        resolve(result);
      };
    };
  });
};

const ImageVariableInput: React.FC<ImageVariableInputProps> = ({ variable, value, onChange }) => {
  const [preview, setPreview] = useState<string>(value || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sizeInfo, setSizeInfo] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    setSizeInfo('');
    try {
      const compressed = await compressImage(file);
      const kb = Math.round((compressed.length * 0.75) / 1024);
      setSizeInfo(`~${kb} KB`);
      setPreview(compressed);
      onChange(variable.nombre, compressed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la imagen');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreview('');
    setSizeInfo('');
    setError(null);
    onChange(variable.nombre, '');
  };

  if (!variable.nombre.toLowerCase().includes('img')) return null;

  return (
    <div className="form-group">
      <label>
        {variable.etiqueta}
        {variable.es_requerida === 1 && <span className="required">*</span>}
      </label>

      <div className="image-input-container">
        {preview ? (
          <div className="image-preview-wrapper">
            <img src={preview} alt={variable.etiqueta} className="image-preview" />
            <button type="button" className="image-remove-btn" onClick={handleRemove} title="Eliminar imagen">
              ×
            </button>
          </div>
        ) : (
          <div className="image-upload-area" onClick={() => !loading && fileInputRef.current?.click()}>
            <span className="upload-icon">{loading ? '⏳' : '🖼️'}</span>
            <span className="upload-text">{loading ? 'Procesando...' : 'Haz clic para subir imagen'}</span>
            <span className="upload-hint">JPG, PNG o WEBP · Máx {MAX_SIZE_MB} MB</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {preview ? (
          <button type="button" className="image-change-btn" onClick={() => fileInputRef.current?.click()}>
            Cambiar imagen
          </button>
        ) : !loading && (
          <button type="button" className="image-upload-btn" onClick={() => fileInputRef.current?.click()}>
            Seleccionar imagen
          </button>
        )}
      </div>

      {sizeInfo && <small className="form-help">Tamaño comprimido: {sizeInfo}</small>}
      {error && <div className="error-message small">{error}</div>}
      {variable.descripcion && <small className="form-help">{variable.descripcion}</small>}
    </div>
  );
};

export default ImageVariableInput;