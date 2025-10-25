import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  MapPinIcon,
  IdentificationIcon,
  CameraIcon,
  XMarkIcon, // Importamos el ícono 'X' para cerrar
} from "@heroicons/react/24/outline";
import type { UserProfile } from "../../pages/hook/usePerfil";

interface Props {
  user: UserProfile;
}

const UserProfileCard: React.FC<Props> = ({ user }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false); // 👈 NUEVO ESTADO para el zoom

  // 🔹 Cargar imagen guardada en localStorage al montar
  useEffect(() => {
    const storedImage = localStorage.getItem(`profileImage_${user.idUsuario}`);
    // Usamos el hook useMemo para calcular la URL de la imagen si está vacía
    if (storedImage) setProfileImage(storedImage);
  }, [user.idUsuario]);

  // 🔹 Generar URL de la imagen, ya sea cargada, por defecto del usuario, o avatar de fallback
  const currentImageUrl = useMemo(() => {
    return (
        profileImage ||
        user.profileImageUrl ||
        `https://ui-avatars.com/api/?name=${user.nombre}&background=E0F2FE&color=1D4ED8&bold=true`
    );
  }, [profileImage, user.profileImageUrl, user.nombre]);


  // 🔹 Manejar selección de imagen
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result as string;
      setProfileImage(base64Image);
      localStorage.setItem(`profileImage_${user.idUsuario}`, base64Image);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center border-t-4 border-blue-500 hover:shadow-xl transition duration-300 relative">
      
      {/* Contenedor de imagen y botón */}
      <div className="relative w-28 h-28 -mt-12">
        <img
          src={currentImageUrl}
          alt={user.nombre}
          onClick={() => setIsImageZoomed(true)} // 👈 ABRIR MODAL al hacer clic
          className="w-28 h-28 rounded-full border-4 border-white shadow-md bg-gray-200 object-cover cursor-pointer hover:opacity-90 transition duration-150"
        />

        {/* Botón flotante para subir imagen */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md transition z-10"
          title="Cambiar foto de perfil"
        >
          <CameraIcon className="h-4 w-4" />
        </button>

        {/* Input invisible para subir imagen */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mt-4">{user.nombre}</h2>
      <p className="text-md text-blue-600 font-semibold mb-2">{user.rol}</p>

      {/* Indicador de Actividad */}
      <div
        className={`text-xs font-medium px-3 py-1 rounded-full mb-4 ${
          user.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {user.activo ? "🟢 ACTIVO" : "🔴 INACTIVO"}
      </div>

      <div className="text-left w-full space-y-2 border-t pt-4">
        {/* ID de Usuario */}
        <p className="flex items-center text-sm text-gray-600">
          <IdentificationIcon className="h-4 w-4 mr-2 text-blue-400" />
          <span className="font-semibold text-gray-800">ID:</span>{" "}
          {user.idUsuario}
        </p>

        {/* Correo Electrónico */}
        <p className="flex items-center text-sm text-gray-600 truncate">
          <EnvelopeIcon className="h-4 w-4 mr-2 text-blue-400" /> {user.email}
        </p>

        {/* Teléfono */}
        {user.telefono && (
          <p className="flex items-center text-sm text-gray-600">
            <PhoneIcon className="h-4 w-4 mr-2 text-blue-400" /> {user.telefono}
          </p>
        )}

        {/* Dirección */}
        {user.direccion && (
          <p className="flex items-start text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 text-blue-400 flex-shrink-0" />
            {user.direccion}
          </p>
        )}

        {/* Fecha de Registro */}
        <p className="flex items-center text-sm text-gray-600">
          <CalendarDaysIcon className="h-4 w-4 mr-2 text-blue-400" />
          <span className="font-semibold">Registrado:</span>{" "}
          {new Date(user.fechaRegistro).toLocaleDateString()}
        </p>
      </div>

      {/* 👈 MODAL DE ZOOM DE IMAGEN (VERSION LIGERA Y NO INTRUSIVA) */}
      {isImageZoomed && (
        <div 
            // Fondo muy sutil (20%) y efecto de desenfoque para no oscurecer por completo
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300"
            onClick={() => setIsImageZoomed(false)} // Cerrar al hacer clic fuera
        >
          <div 
              // Contenedor más pequeño (max-w-sm) y redondeado
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()} // Evitar que el clic en el panel cierre el modal
          >
            {/* Botón de cerrar, colocado para que contraste con el fondo sutil */}
            <button
              onClick={() => setIsImageZoomed(false)}
              className="absolute -top-10 right-0 p-2 bg-gray-900/70 hover:bg-gray-900 text-white rounded-full shadow-lg transition z-20"
              title="Cerrar vista ampliada"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            {/* Imagen ampliada */}
            <img
              src={currentImageUrl}
              alt={`${user.nombre} - Perfil ampliado`}
              className="w-full h-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileCard;
