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

// Límites más agresivos para no reventar el body del servidor (evitar 413)
const MAX_SIZE_MB = 0.5;      // rechazar archivos > 500KB antes de comprimir
const TARGET_KB = 60;         // objetivo: < 60KB en base64 por imagen
const MAX_DIMENSION = 600;    // px máximo en cualquier lado

/**
 * Comprime una imagen de forma agresiva hasta quedar bajo TARGET_KB.
 * Intenta primero con calidad 0.6, luego 0.4, luego 0.25, luego 0.15.
 * Si sigue siendo grande, reduce también las dimensiones.
 */
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
        // Escalar dimensiones
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
        if (!ctx) {
          reject(new Error('No se pudo obtener contexto canvas'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Intentar calidades decrecientes hasta alcanzar TARGET_KB
        const qualities = [0.6, 0.4, 0.25, 0.15];
        let result = '';

        for (const q of qualities) {
          result = canvas.toDataURL('image/jpeg', q);
          // base64 tiene overhead ~4/3 — aproximamos tamaño real
          const approxKB = (result.length * 0.75) / 1024;
          if (approxKB <= TARGET_KB) break;
        }

        // Si aún es grande, reducir dimensiones a la mitad y reintentar
        const approxKB = (result.length * 0.75) / 1024;
        if (approxKB > TARGET_KB && (width > 200 || height > 200)) {
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

const ImageVariableInput: React.FC<ImageVariableInputProps> = ({
  variable,
  value,
  onChange,
}) => {
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
      const compressedBase64 = await compressImage(file);
      const approxKB = Math.round((compressedBase64.length * 0.75) / 1024);
      setSizeInfo(`~${approxKB} KB`);
      setPreview(compressedBase64);
      onChange(variable.nombre, compressedBase64);
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
    onChange(variable.nombre, '');
    setError(null);
  };

  const isImageVariable = variable.nombre.toLowerCase().includes('img');
  if (!isImageVariable) return null;

  return (
    <div className="form-group">
      <label>
        {variable.etiqueta}
        {variable.es_requerida === 1 && <span className="required">*</span>}
      </label>

      <div className="image-input-container">
        {preview ? (
          <div className="image-preview-wrapper">
            <img
              src={preview}
              alt={variable.etiqueta}
              className="image-preview"
            />
            <button
              type="button"
              className="image-remove-btn"
              onClick={handleRemove}
              title="Eliminar imagen"
            >
              ×
            </button>
          </div>
        ) : (
          <div
            className="image-upload-area"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="upload-icon">🖼️</span>
            <span className="upload-text">
              {loading ? 'Procesando...' : 'Haz clic para subir imagen'}
            </span>
            <span className="upload-hint">
              Máx {MAX_SIZE_MB}MB · hasta {MAX_DIMENSION}px
            </span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {!preview && !loading && (
          <button
            type="button"
            className="image-upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            Seleccionar imagen
          </button>
        )}

        {preview && (
          <button
            type="button"
            className="image-change-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            Cambiar imagen
          </button>
        )}
      </div>

      {sizeInfo && (
        <small className="form-help" style={{ color: 'var(--text-muted)' }}>
          Tamaño comprimido: {sizeInfo}
        </small>
      )}
      {error && <div className="error-message small">{error}</div>}
      {variable.descripcion && (
        <small className="form-help">{variable.descripcion}</small>
      )}
    </div>
  );
};

export default ImageVariableInput;