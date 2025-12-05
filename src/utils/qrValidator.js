// utils/qrValidator.js

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyHwjESkowKbE-lcGsdnnk8Cvwe20ILkmEsH1UhKaft9dXxMW2zISG7iDKQTQD9hMNyPA/exec';

/**
 * Obtiene el código QR de la URL actual
 */
export const getQRFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('qr');
};

/**
 * Verifica si un código QR está activo (usando GET - perfecto para esto)
 */
export const verificarQRActivo = async (qrCode) => {
    if (!qrCode) {
        return { activo: false, mensaje: 'No se encontró código QR' };
    }

    try {
        const url = `${APPS_SCRIPT_URL}?action=verificarQR&qr=${encodeURIComponent(qrCode)}`;

        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        return {
            activo: !!data.activo,
            mensaje: data.mensaje || (data.activo ? 'QR válido' : 'QR no activo')
        };
    } catch (error) {
        console.error('Error verificando QR:', error);
        return {
            activo: false,
            mensaje: 'Error de conexión. Intenta de nuevo.'
        };
    }
};

/**
 * Verifica si el teléfono o correo ya están registrados
 * @param {string} telefono - Número de teléfono a verificar
 * @param {string} correo - Correo electrónico a verificar
 * @returns {Promise<{duplicado: boolean, telefonoDuplicado: boolean, correoDuplicado: boolean, mensaje: string}>}
 */
export const verificarDuplicado = async (telefono, correo) => {
    if (!telefono && !correo) {
        return {
            duplicado: false,
            telefonoDuplicado: false,
            correoDuplicado: false,
            mensaje: 'No hay datos para verificar'
        };
    }

    try {
        const params = new URLSearchParams();
        params.append('action', 'verificarDuplicado');
        if (telefono) params.append('telefono', telefono);
        if (correo) params.append('correo', correo);

        const url = `${APPS_SCRIPT_URL}?${params.toString()}`;

        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        return {
            duplicado: !!data.duplicado,
            telefonoDuplicado: !!data.telefonoDuplicado,
            correoDuplicado: !!data.correoDuplicado,
            mensaje: data.mensaje || 'Verificación completada'
        };
    } catch (error) {
        console.error('Error verificando duplicados:', error);
        return {
            duplicado: false,
            telefonoDuplicado: false,
            correoDuplicado: false,
            mensaje: 'Error al verificar. Intenta de nuevo.'
        };
    }
};

/**
 * Envía los datos del ganador usando FormData + POST
 * → Evita problemas de longitud de URL
 * → Evita problemas con caracteres especiales (@, espacios, etc)
 * → Funciona perfecto con CORS en Apps Script
 */
export const enviarDatosGanador = async (formData, qrCode) => {
    const formDataToSend = new FormData();
    formDataToSend.append('action', 'registrarGanador');
    formDataToSend.append('qr', qrCode);
    formDataToSend.append('nombre', formData.nombre.trim());
    formDataToSend.append('apellido', formData.apellido.trim());
    formDataToSend.append('telefono', formData.telefono);
    formDataToSend.append('correo', formData.email.trim());

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: formDataToSend,
            mode: 'cors'
        });

        const data = await response.json();

        return {
            status: data.status || 'error',
            message: data.message || 'Respuesta inesperada del servidor'
        };
    } catch (error) {
        console.error('Error enviando ganador:', error);
        return {
            status: 'error',
            message: 'Sin conexión. Revisa tu internet e intenta de nuevo.'
        };
    }
};