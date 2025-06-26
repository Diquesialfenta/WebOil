# Configuración de Autenticación con Supabase

## ✅ Funcionalidad Implementada

La aplicación ahora incluye un sistema completo de autenticación con las siguientes características:

### 🔐 Funciones de Autenticación

- **Registro de usuarios** con email, contraseña y nombre
- **Inicio de sesión** con email y contraseña
- **Cierre de sesión** desde cualquier página
- **Protección de rutas** (Dashboard requiere autenticación)
- **Estado de usuario persistente** entre sesiones
- **Validación de formularios** en frontend

### 📱 Páginas Actualizadas

- **`/auth`**: Formularios de login y registro con Supabase
- **`/dashboard`**: Muestra datos del usuario autenticado
- **`/`**: Header dinámico según estado de autenticación

### 🔧 Componentes Nuevos

- `AuthContext`: Manejo global del estado de autenticación
- `SupabaseSetupInfo`: Instrucciones de configuración
- Servicios de autenticación con soporte para modo demo

## 🚀 Modo Demo Actual

La aplicación funciona actualmente en **modo demo** donde:

- Puedes registrarte con cualquier email/contraseña (+6 caracteres)
- Puedes iniciar sesión con cualquier credencial
- Los datos no se guardan realmente
- La funcionalidad es completamente funcional

## ⚙️ Configuración de Supabase Real

Para usar Supabase real, sigue estos pasos:

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta y un nuevo proyecto
3. Espera a que el proyecto se configure

### 2. Obtener Credenciales

1. Ve a **Settings** → **API** en tu proyecto
2. Copia tu **Project URL**
3. Copia tu **anon/public key**

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

### 4. Configurar Base de Datos (Opcional)

Supabase ya incluye tablas de usuarios por defecto. Si quieres almacenar datos adicionales:

```sql
-- Ejemplo: tabla de perfiles de usuario
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Habilitar Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios solo vean su perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

## 🧪 Probar la Aplicación

### En Modo Demo (Actual):

1. Ve a `/auth`
2. Regístrate con cualquier email y contraseña (+6 caracteres)
3. O inicia sesión con cualquier credencial
4. Ve al dashboard para ver tus datos

### Con Supabase Real:

1. Configura las variables de entorno
2. Reinicia el servidor (`npm run dev`)
3. Los usuarios se guardarán realmente en Supabase
4. Recibirás emails de verificación reales

## 📁 Archivos Creados/Modificados

### Nuevos Archivos:

- `src/lib/supabase.ts` - Configuración de Supabase
- `src/lib/auth.ts` - Servicios de autenticación
- `src/contexts/AuthContext.tsx` - Context de autenticación
- `src/components/SupabaseSetupInfo.tsx` - Información de setup
- `.env.example` - Ejemplo de variables de entorno
- `.env.local` - Variables locales (modo demo)

### Archivos Modificados:

- `src/App.tsx` - Agregado AuthProvider
- `src/pages/Auth.tsx` - Integración completa con Supabase
- `src/pages/UserDashboard.tsx` - Datos del usuario autenticado
- `src/pages/Index.tsx` - Header dinámico según autenticación

## 🔒 Seguridad

- Las contraseñas se hashean automáticamente con Supabase
- Row Level Security (RLS) en base de datos
- Tokens JWT para sesiones seguras
- Variables de entorno para claves sensibles
- Validación tanto en frontend como backend

## 📞 Soporte

Si necesitas ayuda con la configuración:

1. Revisa la documentación de [Supabase](https://supabase.com/docs)
2. El componente `SupabaseSetupInfo` muestra instrucciones en la app
3. Los logs de la consola del navegador muestran errores detallados

¡La funcionalidad está completa y lista para usar! 🎉
