import { useState, useEffect } from 'react';
import { Mail, Phone, User, Gift, Utensils, AlertCircle } from 'lucide-react';
import { getQRFromURL, verificarQRActivo, enviarDatosGanador } from './utils/qrValidator';

function App() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: ''
  });

  const [qrCode, setQrCode] = useState(null);
  const [qrValido, setQrValido] = useState(false);
  const [verificandoQR, setVerificandoQR] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Verificar QR al cargar la página
  useEffect(() => {
    const verificarQR = async () => {
      const qr = getQRFromURL();

      if (!qr) {
        setQrValido(false);
        setVerificandoQR(false);
        return;
      }

      setQrCode(qr);
      const resultado = await verificarQRActivo(qr);
      setQrValido(resultado.activo);
      setVerificandoQR(false);
    };

    verificarQR();
  }, []);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'nombre':
      case 'apellido':
        if (/\d/.test(value)) {
          error = 'No se permiten números';
        }
        break;
      case 'telefono':
        if (value && !value.startsWith('3')) {
          error = 'Debe comenzar con 3';
        } else if (value && value.length !== 10) {
          error = 'Debe tener 10 dígitos';
        } else if (!/^\d*$/.test(value)) {
          error = 'Solo números';
        }
        break;
      case 'email':
        if (value && (!value.includes('@') || !value.includes('.'))) {
          error = 'Debe contener @ y .';
        }
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error
    });
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.apellido || !formData.telefono || !formData.email) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (Object.values(errors).some(error => error)) {
      alert('Por favor corrige los errores antes de continuar');
      return;
    }

    setIsSubmitting(true);

    const resultado = await enviarDatosGanador(formData, qrCode);

    setIsSubmitting(false);

    if (resultado.status === 'success') {
      setShowSuccess(true);
      setFormData({ nombre: '', apellido: '', telefono: '', email: '' });
    } else {
      alert(resultado.message || 'Error al registrar. Intenta nuevamente.');
    }
  };

  // Pantalla de verificación
  if (verificandoQR) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl shadow-2xl mb-6">
            <Utensils className="w-12 h-12 text-white animate-pulse" strokeWidth={2.5} />
          </div>
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-200 text-lg">Verificando código QR...</p>
        </div>
      </div>
    );
  }

  // QR Inválido o Deshabilitado
  if (!qrValido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6 ring-4 ring-red-500/20">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">
                Código QR Inválido
              </h3>
              <p className="text-orange-200/80 mb-6">
                Este código QR no está habilitado o no existe. Por favor, verifica que hayas escaneado el código correcto.
              </p>
              <p className="text-zinc-500 text-sm">
                Si crees que esto es un error, contacta al personal del restaurante.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulario principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center p-4 px-4">
      <div className="w-full max-w-md">
        {/* Header premium */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl shadow-2xl mb-6 ring-4 ring-orange-500/20">
            <Utensils className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Canjea tu Premio
          </h1>
          <p className="text-orange-200/80 text-lg">
            Completa tus datos
          </p>
          <p className="text-zinc-500 text-sm mt-2">
            Código: {qrCode}
          </p>
        </div>

        {/* Card con glassmorphism */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-8 pt-10 pb-10">
            {showSuccess ? (
              <div className="text-center py-12 animate-in fade-in zoom-in duration-700">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-6 shadow-2xl">
                  <Gift className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">
                  ¡Premio Canjeado!
                </h3>
                <p className="text-orange-200">
                  Ya puedes revisar tu correo electrónico para ver tu ticket ganador!
                </p>
              </div>
            ) : (
              <div className="space-y-7">
                {/* Campo Nombre */}
                <div>
                  <label className="block text-sm font-medium text-orange-200 mb-2 pl-1">
                    Nombre
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400/70 group-focus-within:text-orange-400 transition-colors" />
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-5 py-4 text-white placeholder-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      placeholder="Tu nombre"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  {errors.nombre && <p className="text-red-400 text-xs mt-1 ml-1">{errors.nombre}</p>}
                </div>

                {/* Campo Apellido */}
                <div>
                  <label className="block text-sm font-medium text-orange-200 mb-2 pl-1">
                    Apellido
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400/70 group-focus-within:text-orange-400 transition-colors" />
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-5 py-4 text-white placeholder-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      placeholder="Tu apellido"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  {errors.apellido && <p className="text-red-400 text-xs mt-1 ml-1">{errors.apellido}</p>}
                </div>

                {/* Campo Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-orange-200 mb-2 pl-1">
                    Teléfono
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400/70 group-focus-within:text-orange-400 transition-colors" />
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-5 py-4 text-white placeholder-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      placeholder="300 123 4567"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  {errors.telefono && <p className="text-red-400 text-xs mt-1 ml-1">{errors.telefono}</p>}
                </div>

                {/* Campo Email */}
                <div>
                  <label className="block text-sm font-medium text-orange-200 mb-2 pl-1">
                    Correo Electrónico
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400/70 group-focus-within:text-orange-400 transition-colors" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-5 py-4 text-white placeholder-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      placeholder="tu@email.com"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email}</p>}
                </div>

                {/* Botón premium */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold py-5 rounded-2xl shadow-2xl transform hover:scale-105 active:scale-100 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isSubmitting ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Gift className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        Canjear Ahora
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-500 text-sm mt-8">
          Al enviar tus datos aceptas nuestros términos y condiciones
        </p>
      </div>
    </div>
  );
}

export default App;