const mysql = require('mysql');
const express = require('express');
const app = express();
const port = 3000;

const methodOverride = require('method-override');
app.use(methodOverride('_method'));


// Configuración de Pug como motor de plantillas
app.set('view engine', 'pug');
app.set('views', './views');

// Middleware para procesar datos de formularios enviados por POST
app.use(express.urlencoded({ extended: true }));

// Configuración de Express para servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

// Configuración de la conexión a la base de datos MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'laboratorio15'
});

// Conexión a la base de datos
connection.connect((error) => {
    if (error) {
        console.error('Error al conectarse a MySQL: ', error);
        return;
    }
    console.log('¡Conectado a la base de datos MySQL!');
});

// Ruta para listar todos los alumnos y sus cursos
app.get('/', (_req, res) => {
    const query = `
        SELECT alumnos.id, alumnos.nombre AS alumno, alumnos.edad, cursos.nombre AS curso
        FROM alumnos
        LEFT JOIN cursos ON alumnos.curso_id = cursos.id
    `;
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error al ejecutar la consulta: ', error);
            return res.status(500).send('Error interno del servidor');
        }
        res.render('index', { alumnos: results }); // Nota el nombre `alumnos`
    });
});
// Ruta para agregar un alumno
app.post('/add', (req, res) => {
    const { nombre, edad, curso_id } = req.body;

    if (!nombre || !edad || !curso_id) {
        console.error('Datos inválidos');
        return res.redirect('/add');  // Si hay algún dato inválido, redirige de nuevo al formulario
    }

    const consulta = 'INSERT INTO alumnos (nombre, edad, curso_id) VALUES (?, ?, ?)';
    connection.query(consulta, [nombre, edad, curso_id], (error) => {
        if (error) {
            console.error('Error al agregar el alumno: ', error);
            return res.status(500).send('Error interno del servidor');
        }
        console.log('Alumno agregado correctamente');
        res.redirect('/');  // Después de agregar al alumno, redirige al listado
    });
});


app.get('/add', (_req, res) => {
    const query = 'SELECT * FROM cursos';
    connection.query(query, (error, cursosResults) => {
        if (error) {
            console.error('Error al obtener los cursos: ', error);
            return res.status(500).send('Error interno del servidor');
        }
        res.render('add', { cursos: cursosResults });
    });
});


// Ruta para insertar un nuevo alumno
app.post('/create', (req, res) => {
    const { nombre, edad, cursoId } = req.body;

    if (!nombre || !edad || !cursoId) {
        console.error('Datos inválidos');
        return res.redirect('/add');
    }

    const consulta = 'INSERT INTO alumnos (nombre, edad, curso_id) VALUES (?, ?, ?)';
    connection.query(consulta, [nombre, edad, cursoId], (error) => {
        if (error) {
            console.error('Error al insertar el alumno: ', error);
            return res.status(500).send('Error interno del servidor');
        }
        console.log('Alumno agregado correctamente');
        res.redirect('/');
    });
});

// Ruta para actualizar un alumno
app.put('/alumnos/:id', (req, res) => {
    const alumnoId = parseInt(req.params.id, 10);
    const { nombre, edad, curso_id } = req.body;

    if (!nombre || !edad || !curso_id) {
        console.error('Datos inválidos');
        return res.status(400).send('Faltan datos obligatorios');
    }

    const consulta = 'UPDATE alumnos SET nombre = ?, edad = ?, curso_id = ? WHERE id = ?';
    connection.query(consulta, [nombre, edad, curso_id, alumnoId], (error) => {
        if (error) {
            console.error('Error al actualizar el alumno: ', error);
            return res.status(500).send('Error interno del servidor');
        }
        console.log('Alumno actualizado correctamente');
        res.redirect('/');
    });
});


// Ruta para mostrar el formulario de edición de un alumno
app.get('/update/:id', (req, res) => {
    const alumnoId = parseInt(req.params.id, 10);
    if (isNaN(alumnoId)) {
        console.error(`ID inválido: ${req.params.id}`);
        return res.status(400).send('ID inválido');
    }

    const queryAlumno = 'SELECT * FROM alumnos WHERE id = ?';
    const queryCursos = 'SELECT * FROM cursos';

    connection.query(queryAlumno, [alumnoId], (error, alumnoResults) => {
        if (error) {
            console.error('Error al obtener el alumno: ', error);
            return res.status(500).send('Error interno del servidor');
        }

        if (alumnoResults.length === 0) {
            console.error(`No se encontró el alumno con id: ${alumnoId}`);
            return res.status(404).send('Alumno no encontrado');
        }

        connection.query(queryCursos, (error, cursosResults) => {
            if (error) {
                console.error('Error al obtener los cursos: ', error);
                return res.status(500).send('Error interno del servidor');
            }

            res.render('update', {
                alumno: alumnoResults[0],
                cursos: cursosResults,
            });
        });
    });
});

// Ruta para actualizar un alumno
app.post('/update', (req, res) => {
    const { id, nombre, edad, cursoId } = req.body;

    if (!id || !nombre || !edad || !cursoId) {
        console.error('Datos inválidos');
        return res.redirect('/');
    }

    const consulta = 'UPDATE alumnos SET nombre = ?, edad = ?, curso_id = ? WHERE id = ?';
    connection.query(consulta, [nombre, edad, cursoId, id], (error) => {
        if (error) {
            console.error('Error al actualizar el alumno: ', error);
            return res.status(500).send('Error interno del servidor');
        }
        console.log('Alumno actualizado correctamente');
        res.redirect('/');
    });
});

// Ruta para eliminar un alumno
app.post('/delete', (req, res) => {
    const { id } = req.body;

    if (!id) {
        console.error('Datos inválidos');
        return res.redirect('/');
    }

    const consulta = 'DELETE FROM alumnos WHERE id = ?';
    connection.query(consulta, [id], (error) => {
        if (error) {
            console.error('Error al eliminar el alumno: ', error);
            return res.status(500).send('Error interno del servidor');
        }
        console.log('Alumno eliminado correctamente');
        res.redirect('/');
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});
