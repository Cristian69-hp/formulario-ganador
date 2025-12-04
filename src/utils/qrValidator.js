// URL de tu Apps Script desplegado como Web App
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwTLFI_Tcu4wGfESml9DDwzIKpgGyBDef_e3-f6W1YgvuHvlfmZbWlg-n7Dk6QInxY58A/exec'; // Reemplazar con la URL real

/**
 * Obtiene el código QR de la URL actual
 * @returns {string|null} El código QR o null si no existe
 */0
export const getQRFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('qr');
};

/**
 * Verifica si un código QR está activo en Google Sheets
 * @param {string} qrCode - Código QR a verificar (QR001, QR002, QR003)
 * @returns {Promise<{activo: boolean, mensaje?: string}>}
 */
export const verificarQRActivo = async (qrCode) => {
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'verificarQR',
                qr: qrCode
            })
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();
        return {
            activo: data.activo || false,
            mensaje: data.mensaje
        };
    } catch (error) {
        console.error('Error verificando QR:', error);
        return {
            activo: false,
            mensaje: 'Error al verificar el código QR'
        };
    }
};

/**
 * Envía los datos del formulario al servidor
 * @param {Object} formData - Datos del formulario
 * @param {string} qrCode - Código QR usado
 * @returns {Promise<{status: string, message: string}>}
 */
export const enviarDatosGanador = async (formData, qrCode) => {
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'registrarGanador',
                qr: qrCode,
                nombre: formData.nombre,
                apellido: formData.apellido,
                telefono: formData.telefono,
                correo: formData.email
            })
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error enviando datos:', error);
        return {
            status: 'error',
            message: 'Error de conexión. Por favor intenta nuevamente.'
        };
    }
};