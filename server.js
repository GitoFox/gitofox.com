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

app.post('/webhook', (req, res) => {
  exec(`
      docker stop gitofoxcom_app_1 &&
      docker rm gitofoxcom_app_1 &&
      git pull &&
      docker build -t gitofoxcom_app . &&
      docker run -d --name gitofoxcom_app_1 gitofoxcom_app
  `, (err, stdout, stderr) => {
      if (err) {
          // Algo salió mal
          console.error(err);
      } else {
          // Todo bien
          console.log(stdout);
      }
  });
  res.sendStatus(200);
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