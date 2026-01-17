# GUÍA DE DESPLIEGUE EN VERCEL - PASO A PASO

## PREPARACIÓN PREVIA

### 1. Configurar Firebase Storage (Solo lo necesario)

1. Ve a https://console.firebase.google.com/
2. Crea un nuevo proyecto o usa uno existente
3. En el menú lateral, ve a **Storage**
4. Haz clic en **Comenzar**
5. Selecciona **Modo de prueba** (luego cambiaremos las reglas)
6. Selecciona una ubicación (ej: europe-west1)
7. Copia las siguientes credenciales desde **Configuración del proyecto** > **General**:

   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Sender ID

### 2. Configurar Supabase PostgreSQL

1. Ve a https://supabase.com/
2. Sign up / Login
3. Crea un **New Project**
4. Espera a que se cree (2-3 minutos)
5. Ve a **Settings** > **Database**
6. Copia la **Connection string** con formato:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

7. Ve a **Settings** > **API** y guarda:
   - `anon public` key (por si la necesitas más tarde)
   - `service_role` key (por si la necesitas más tarde)

---

## PARTE 1: DESPLEGAR LA API EN VERCEL

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Login en Vercel

```bash
vercel login
```

Esto abrirá el navegador para que te autentiques.

### Paso 3: Desplegar la API

```bash
cd apps/api
vercel
```

Cuando te pregunte, responde:
- **Set up and deploy?** Y
- **Which scope?** Tu cuenta
- **Link to existing project?** N
- **Project name:** aula-virtual-api (o el que quieras)
- **In which directory is your code?** (deja vacío, es el actual)
- **Want to override settings?** N

### Paso 4: Configurar Variables de Entorno de la API

Ve a https://vercel.com/dashboard y:

1. Entra a tu proyecto **aula-virtual-api**
2. Ve a **Settings** > **Environment Variables**
3. Añade estas variables:

```
DATABASE_URL
postgresql://postgres:TU_PASSWORD@db.TU_PROJECT_REF.supabase.co:5432/postgres
```

```
NEXT_PUBLIC_FIREBASE_API_KEY
TU_FIREBASE_API_KEY
```

```
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
TU_PROJECT.firebaseapp.com
```

```
NEXT_PUBLIC_FIREBASE_PROJECT_ID
TU_PROJECT_ID
```

```
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
TU_PROJECT.appspot.com
```

```
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
TU_SENDER_ID
```

```
JWT_SECRET
cambia-esto-por-una-clave-segura-muy-larga-y-aleatoria
```

```
NODE_ENV
ayuda para elegir el root directory en vercel
```

4. IMPORTANTE: Selecciona los entornos donde aplicar cada variable:
   - **Production**, **Preview**, **Development** (marca los tres)

### Paso 5: Redesplegar la API

```bash
vercel --prod
```

Copia la URL de producción que te dará (ej: `https://aula-virtual-api.vercel.app`)

---

## PARTE 2: DESPLEGAR EL FRONTEND EN VERCEL

### Paso 1: Volver a la raíz del proyecto

```bash
cd ../..
```

### Paso 2: Crear archivo de configuración para el web

El archivo `vercel.json` ya existe en la raíz, así que podemos proceder.

### Paso 3: Desplegar el Frontend

```bash
vercel
```

Cuando te pregunte, responde:
- **Set up and deploy?** Y
- **Which scope?** Tu cuenta
- **Link to existing project?** N
- **Project name:** aula-virtual-web (o el que quieras)
- **In which directory is your code?** apps/web
- **Want to override settings?** N

### Paso 4: Configurar Variables de Entorno del Web

Ve a https://vercel.com/dashboard y:

1. Entra a tu proyecto **aula-virtual-web**
2. Ve a **Settings** > **Environment Variables**
3. Añade estas variables:

```
NEXT_PUBLIC_API_URL
https://aula-virtual-api.vercel.app
```

```
NEXT_PUBLIC_APP_URL
https://aula-virtual-web.vercel.app
```

NOTA: Estas variables empiezan con `NEXT_PUBLIC_` para que estén disponibles en el navegador.

### Paso 5: Redesplegar el Web

```bash
vercel --prod
```

---

## PARTE 3: MIGRAR LA BASE DE DATOS

Una vez desplegada la API:

1. Desde tu terminal, en la carpeta `apps/api`:

```bash
cd apps/api
```

2. Configura la DATABASE_URL de producción en un archivo temporal:

```bash
echo "DATABASE_URL=\"postgresql://postgres:TU_PASSWORD@db.TU_PROJECT_REF.supabase.co:5432/postgres\"" > .env.production
```

3. Ejecuta las migraciones:

```bash
npx prisma migrate deploy
```

4. Opcional: Si quieres usar Prisma Studio para ver los datos:

```bash
npx prisma studio
```

---

## PARTE 4: VERIFICAR EL DESPLIEGUE

1. **Accede a tu URL del frontend** (ej: `https://aula-virtual-web.vercel.app`)

2. **Verifica:**
   - ✅ La página carga correctamente
   - ✅ Puedes ir a `/login`
   - ✅ El registro funciona (crea un usuario profesor)
   - ✅ El login funciona

3. **Si algo falla:**
   - Ve a **Deployments** en Vercel
   - Clic en el deployment más reciente
   - Ve a **Build Logs** para ver errores
   - Ve a **Function Logs** para ver errores de runtime

---

## PROBLEMAS COMUNES Y SOLUCIONES

### Error: "Cannot connect to database"
**Solución:** Verifica que la DATABASE_URL es correcta y que permite conexiones externas desde cualquier IP (configuración de Supabase)

### Error: "Firebase: no matching project"
**Solución:** Verifica que las credenciales de Firebase son correctas

### Error: "File upload failed"
**Solución:**
1. Verifica que Firebase Storage esté habilitado
2. Ve a Firebase Console > Storage > Rules
3. Cambia las reglas a:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false; // Solo desde servidor
    }
  }
}
```

### Error: "JWT_SECRET is not defined"
**Solución:** Añade la variable JWT_SECRET en Vercel

### Error: "API no responde"
**Solución:**
1. Verifica que NEXT_PUBLIC_API_URL en el frontend apunte a la URL correcta de la API
2. Verifica los logs de la API en Vercel

---

## CONFIGURACIÓN DE DOMINIO PERSONALIZADO (OPCIONAL)

Si tienes un dominio propio:

1. Ve a **Settings** > **Domains** en tu proyecto de Vercel
2. Añade tu dominio
3. Vercel te dará instrucciones para configurar DNS
4. Actualiza NEXT_PUBLIC_API_URL y NEXT_PUBLIC_APP_URL con tu nuevo dominio
