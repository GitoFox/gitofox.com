const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment');
const crypto = require('crypto');
const git = require('simple-git');
const { exec } = require('child_process');

const app = express();

const PORT = process.env.PORT || 3000;


app.use(cors({
  origin: '*',
  exposedHeaders: 'Referer'
}));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

const secret = 'gitofox1799'; // your github webhook secret

app.use(bodyParser.json());

app.post('/github-webhook', (req, res) => {
    let signature = req.headers['x-hub-signature'];
    let payload = JSON.stringify(req.body);
    let hash = crypto.createHmac('sha1', secret).update(payload).digest('hex');
    
    if (signature !== `sha1=${hash}`) {
        res.status(403).send('Invalid signature');
        return;
    }

    // Aquí puedes manejar los distintos tipos de eventos
    if(req.body.ref === 'refs/heads/main') {  // Adjust 'main' to whatever branch you want to handle
        if(req.headers['x-github-event'] === "push") {
            console.log("Received push event");
            // Aquí es donde ejecutarías el código para manejar el evento
            // Por ejemplo, podrías tirar y reiniciar tu aplicación, borrar la caché, etc.
        }
    }
    
    // Respond to GitHub that we received the webhook
    res.status(200).send('Received');
});

// Ruta para buscar a un encuestador por su RUT
app.get('/encuestadores/:rut', (req, res) => {
  const rut = req.params.rut.trim();

  const results = [];

  fs.createReadStream('encuestadores.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const encuestador = results.find((encuestador) => encuestador.rut.trim() === rut);

      if (encuestador) {
        let imagenPath = encuestador.imagen;
        let imagenURL;
        let sinImagen = false; // Variable para empleados sin imagen

        if (!imagenPath || imagenPath === 'NA' || imagenPath === '') {
          // Asignar la ruta de la imagen fija cuando no hay imagen disponible
          imagenPath = 'img/Saludando.png';
          sinImagen = true; // Establecer la variable sinImagen en true
        }

        imagenURL = 'https://gitofox.com/img/' + path.basename(imagenPath); // Obtén solo el nombre del archivo de la imagen
        encuestador.imagenURL = imagenURL;
        encuestador.sinImagen = sinImagen; // Agregar la variable sinImagen al encuestador

        // Leer y procesar los proyectos del encuestador
        const proyectos = results.filter((proyecto) => proyecto.rut && proyecto.rut.trim() === rut);

        const currentDate = moment();

        const proyectosActivos = [];
        const proyectosExpirados = [];

        proyectos.forEach((proyecto) => {
          const fechaFin = moment(proyecto.proyecto_fecha_fin, 'M/D/YYYY');
          const estaActivo = currentDate.isSameOrBefore(fechaFin, 'day');

          const proyectoClasificado = {
            nombre: proyecto.proyecto_nom,
            fechaInicio: proyecto.proyecto_fecha_ini,
            fechaFin: proyecto.proyecto_fecha_fin,
          };

          if (estaActivo) {
            proyectosActivos.push(proyectoClasificado);
          } else {
            proyectosExpirados.push(proyectoClasificado);
          }
        });

        encuestador.proyectosActivos = proyectosActivos;
        encuestador.proyectosExpirados = proyectosExpirados;

        // Devolver solo los datos del encuestador y sus proyectos asociados
        res.json(encuestador);
      } else {
        res.status(404).json({ error: 'Encuestador no encontrado' });
      }
    });
});

// Ruta para servir las imágenes de los encuestadores
app.use('/img', express.static(path.join(__dirname, 'img')));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});