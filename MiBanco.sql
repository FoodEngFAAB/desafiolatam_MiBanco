/*
CREATE DATABASE Banco;
*/

SELECT * FROM transacciones
SELECT * FROM cuenta1
SELECT * FROM cuenta2


/*Crea tabla de transacciones*/
CREATE TABLE transacciones (descripcion varchar (50), fecha varchar (10), monto DECIMAL , cuenta INT);

/*
Crea tabla de cuentas
*/
CREATE TABLE cuenta1 (id INT, saldo DECIMAL CHECK (saldo>=0));

CREATE TABLE cuenta2 (id INT, saldo DECIMAL CHECK (saldo>=0));

/*
Registrar por lo menos 1 cuenta en la tabla de uentas con un saldo inicial
*/
INSERT INTO cuenta1 values (1, 20000);
INSERT INTO cuenta2 values (1, 20000);
