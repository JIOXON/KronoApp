import { Alert } from "react-native";

export const showAlert = (title, code, onPress = () => {}) => {
  let message = "";

  switch (code) {
    // Errores de la autenticación
    case "auth/invalid-email": message = "El correo no es válido."; break;
    case "auth/user-not-found": message = "No existe ninguna cuenta vinculada a este correo."; break;
    case "auth/wrong-password": message = "La contraseña es incorrecta."; break;
    case "auth/invalid-credential": message = "El usuario no existe o la contraseña incorrecta."; break;
    case "auth/email-already-in-use": message = "Este correo ya está registrado en otra cuenta."; break;
    case "auth/weak-password": message = "La contraseña debe tener al menos 6 caracteres."; break;
    case "auth/missing-password": message = "Por favor, digite su contraseña."; break;
    case "passwords-dont-match": message = "Las contraseñas ingresadas no coinciden. Por favor, verifícalas."; break;
    
    // Parte del register y validaciones
    case "empty-fields": message = "Por favor, completa todos los campos obligatorios."; break;
    case "no-email": message = "Por favor, ingresa tu correo electrónico."; break;
    
    // Procesos y errores
    case "reset-sent": message = "Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico."; break;
    case "cancel-success": message = "Turno cancelado correctamente."; break;
    case "cancel-error": message = "No se pudo cancelar el turno. Inténtalo más tarde."; break;
    case "schedule-success": message = "¡Listo! Tu turno ha sido procesado con éxito."; break;
    case "occupied": message = "Lo sentimos, este turno acaba de ser ocupado por otro usuario."; break;
    case "generic-error": message = "Ocurrió un error inesperado. Inténtalo de nuevo."; break;
    
    // Gestión de servicios (Admin y Generales)
    case "service-success": message = "Servicio agregado correctamente."; break;
    case "service-error": message = "No se pudo crear el servicio."; break;
    case "services-fetch-error": message = "No se pudieron cargar los servicios."; break;

    // Textos legales
    case "terms": 
      message = "Al usar KronoApp, aceptas que gestionemos tus citas de manera eficiente. Nos comprometemos a no usar tu información para fines comerciales externos."; 
      break;
    case "privacy": 
      message = "Tus datos están protegidos. Usamos encriptación de Firebase para asegurar que tu correo y contraseñas permanezcan privados y seguros."; 
      break;
    
    default: message = code || "Ocurrió un error en el sistema.";
  }

  Alert.alert(title, message, [{ text: "Aceptar", onPress }]);
};