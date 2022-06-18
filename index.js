const { Pool } = require("pg")
const Cursor = require("pg-cursor")

////Matriz que contiene los argumentos pasados al proceso cuando se ejecute en la línea de comando.
const args = process.argv.slice(2)
let argsInicial = args[0]
let cuenta1 = args[1]
let cuenta2 = args[2]
let monto = args[3]

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "TUCLAVE",
    database: "Banco",
    port: 5432,
})

// Función asíncrona que crea las transacciones para ABONAR, CARGAR y REGISTRAR los movimientos en las tablas cuentas y transacciones
if (argsInicial == 'NuevaTransaction') {
    pool.connect(async (error_conexion, client, release) => {

        try {
            await client.query("BEGIN")

            // Descontar (cargar) monto a cuenta1
            const descontar = `UPDATE cuentas SET saldo = saldo - ${monto} WHERE id = ${cuenta1} RETURNING *`
            const descuento = await client.query(descontar)
            console.log("Descuento realizado con éxito: ", descuento.rows[0])

            // Sumar (abonar) monto a cuenta2
            const acreditar = `UPDATE cuentas SET saldo = saldo + ${monto} WHERE id = ${cuenta2} RETURNING *`
            const acreditacion = await client.query(acreditar)
            console.log("Acreditación realizada con éxito: ", acreditacion.rows[0])

            // Acreditar transacción
            // Fecha del día
            const event = new Date() 

            // Registra el CARGO del monto a la cuenta1
            const transaccion = `INSERT INTO transacciones (descripcion, fecha, monto, cuenta) VALUES('Transacción CARGO','${event.toLocaleDateString()}',${(monto*-1)},${cuenta1}) RETURNING *`
            const transacciones = await client.query(transaccion)
            console.log("Transaccion CARGO realizada con éxito", transacciones.rows[0])

            // Registra el ABONO del monto a la cuenta2
            const transaccion2 = `INSERT INTO transacciones (descripcion, fecha, monto, cuenta) VALUES('Transacción ABONO','${event.toLocaleDateString()}',${monto},${cuenta2}) RETURNING *`
            const transacciones2 = await client.query(transaccion2)
            console.log("Transaccion ABONO realizada con éxito", transacciones.rows[0])

            // Confirmar datos
            await client.query("COMMIT")

        } catch (e) {
            // Control de errores
            await client.query("ROLLBACK")
            console.log("Error código: " + e.code)
        }
        release()
        pool.end()
    })
}

// Función asíncrona que consulta la tabla transacciones para la cuenta1.
if (argsInicial == 'ConsultaTrans') {
    pool.connect((error_conexion, client, release) => {
        if (error_conexion) {
            console.log(error_conexion)
        } else {
            const consulta = new Cursor(`SELECT * FROM transacciones WHERE cuenta= ${cuenta1} ORDER BY fecha`)
            const cursor = client.query(consulta)
            cursor.read(10, (err, rows) => {
                console.log(rows)
                cursor.close()
                release()
                pool.end()
            })
        }
    })
}

// Función asíncrona para consultar saldo en cuenta1.
if (argsInicial == 'ConsultaSaldo') {
    pool.connect((error_conexion, client, release) => {
        if (error_conexion) {
            console.log(error_conexion)
        } else {
            const consulta = new Cursor(`SELECT * FROM cuentas WHERE id= ${cuenta1}`)
            const cursor = client.query(consulta)
            cursor.read(1, (err, rows) => {
                console.log(`Saldo cuenta ${rows[0].id} es: ${rows[0].saldo}`)
                cursor.close()
                release()
                pool.end()
            })
        }
    })
}

/*

Comandos a ejecutar por consola

Registros de una transacción
node index.js NuevaTransaction 1000 2000 1000
node index.js NuevaTransaction 3000 4000 1234
node index.js NuevaTransaction 5000 6000 2000
node index.js NuevaTransaction 5000 6000 2345
node index.js NuevaTransaction 7000 8000 3000
node index.js NuevaTransaction 9000 1000 3456

Consultar Transacciones de una cuenta
node index.js ConsultaTrans 2000
node index.js ConsultaTrans 3000
node index.js ConsultaTrans 4000
node index.js ConsultaTrans 5000
node index.js ConsultaTrans 6000
node index.js ConsultaTrans 7000
node index.js ConsultaTrans 8000
node index.js ConsultaTrans 9000

Consultar el Saldo de una cuenta
node index.js ConsultaSaldo 1000
node index.js ConsultaSaldo 2000
node index.js ConsultaSaldo 3000
node index.js ConsultaSaldo 4000
node index.js ConsultaSaldo 5000
node index.js ConsultaSaldo 6000
node index.js ConsultaSaldo 7000
node index.js ConsultaSaldo 8000
node index.js ConsultaSaldo 9000

*/
