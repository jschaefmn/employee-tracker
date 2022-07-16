const inquirer = require('inquirer');
const express = require('express');
const db = require('./db/connection');
const cTable = require('console.table');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// confirm connection
db.connect(function (err) {
  if (err) throw err
  console.log('Connected to Database');
  startPrompt();
});

// start of application
function startPrompt() {
  inquirer
    .prompt(
      {
        type: 'list',
        message: 'What would you like to do?',
        name: 'choice',
        choices: [
          'View Employees',
          'View Departments',
          'View Roles',
          'Update an Employee',
          'Add Employee',
          'Add Role',
          'Add Department'
        ]
      }
    ).then(function (val) {
      switch (val.choice) {
        case 'View Employees':
          viewEmployees();
          break;
        case 'View Departments':
          viewDepartments();
          break;
        case 'View Roles':
          viewRoles();
          break;
        case 'Update an Employee':
          updateEmployee();
          break;
        case 'Add Employee':
          addEmployee();
          break;
        case 'Add Role':
          addRole();
          break;
        case 'Add Department':
          addDepartment();
          break;
      }
    })
}

// View Employees
function viewEmployees() {
  const query =
    `SELECT employee.id, employee.first_name AS "first name", employee.last_name AS "last name", role.title, department.name AS department, role.salary, concat(manager.first_name, " ", manager.last_name) AS manager
                    FROM employee
                    LEFT JOIN role
                    ON employee.role_id = role.id
                    LEFT JOIN department
                    ON role.department_id = department.id
                    LEFT JOIN employee manager
                    ON manager.id = employee.manager_id`;

  db.query(query, function (err, res) {
    if (err) throw err;
    console.log(res.length + " employees found");
    console.table("All Employees:", res);
    startPrompt();
  });
}

// view departments
function viewDepartments() {
  const query = `SELECT * FROM department`
  db.query(query, function (err, res) {
    if (err) throw err;
    console.table("All Departments:", res);
    startPrompt();
  });
}

// view roles
function viewRoles() {
  const query =
    `SELECT role.id, role.title, role.salary, department.name AS department FROM role LEFT JOIN department ON role.department_id = department.id;`
  db.query(query, function (err, res) {
    if (err) throw err;
    console.table("All Roles:", res);
    startPrompt();
  });
}

// Update an Employee
function updateEmployee() {
  const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, concat(manager.first_name, " ", manager.last_name) AS manager
  FROM employee
  LEFT JOIN role
  ON employee.role_id = role.id
  LEFT JOIN department
  ON role.department_id = department.id
  LEFT JOIN employee manager
  ON manager.id = employee.manager_id`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
    };
    // console.table(rows);
    const employees = rows.map(({ id, first_name, last_name }) => ({
      value: id,
      name: `${first_name} ${last_name}`
    }));
    inquirer.prompt([{
      type: 'list',
      name: 'employee_id',
      message: "Which employee's role do you want to update?",
      choices: employees
    }])
      .then(answer => {
        let employee_id = answer.employee_id;
        const sql = `SELECT role.id, role.title, role.salary
          FROM role`
        db.query(sql, (err, rows) => {
          let roleChoices = rows.map(({ id, title }) => ({
            value: id,
            name: `${title}`,
          }));
          updateRole(employee_id, roleChoices);
        })
      })
  });
};


// Used for when the user wants to update an employee
function updateRole(employee_id, roleChoices) {
  inquirer.prompt([{
    type: 'list',
    name: 'role',
    message: 'Updated role',
    choices: roleChoices
  }])
    .then(answer => {
      let sql = `UPDATE employee SET role_id = ? 
                  WHERE id = ?`
      const params = [answer.role, employee_id];
      db.query(sql, params, (err, rows) => {
        if (err) {
          console.log(err);
        }
        viewEmployees();
      })
    })
}


// Add Employee
function addEmployee() {
  db.query(`SELECT * FROM role`, function (err, res) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "first_name",
          type: "input",
          message: "What is the employee's first name?",
        },
        {
          name: "last_name",
          type: "input",
          message: "What is the employee's last name?",
        },
        {
          name: "manager_id",
          type: "input",
          message: "What is the manager's ID?",
        },
        {
          name: "role",
          type: "list",
          choices: function () {
            let roleArray = [];
            for (let i = 0; i < res.length; i++) {
              roleArray.push(res[i].title);
            }
            return roleArray;
          },
          message: "What is the employee's role?",
        },
      ])
      .then(function (answer) {
        let role_id;
        for (let a = 0; a < res.length; a++) {
          if (res[a].title == answer.role) {
            role_id = res[a].id;
            console.log(role_id);
          }
        }
        db.query(
          `INSERT INTO employee SET ?`,
          {
            first_name: answer.first_name,
            last_name: answer.last_name,
            manager_id: answer.manager_id,
            role_id: role_id,
          },
          function (err) {
            if (err) throw err;
            console.log("Employee Added!");
            startPrompt();
          }
        );
      });
  });
}
// Add Role
function addRole() {
  const sql = `SELECT * FROM department`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
    };
    const departments = rows.map(({ id, name }) => ({
      value: id,
      name: `${name}`
    }));
    inquirer.prompt([{
      type: 'list',
      name: 'deptChoice',
      message: 'Which department does the new role belong to?',
      choices: departments
    },
    {
      type: 'input',
      name: 'newRole',
      message: 'What is the name of the new role?',
    },
    {
      type: 'input',
      name: 'newSalary',
      message: 'What is the salary?',
    }])
      .then(answer => {
        let title = answer.newRole;
        let salary = answer.newSalary;
        let deptChoice = answer.deptChoice;
        const sql = `INSERT INTO role (title, salary, department_id)
                        VALUES (?, ?, ?)`;
        const params = [title, salary, deptChoice];
        db.query(sql, params, (err, rows) => {
          if (err) {
            console.log(err);
          }
          console.log(`Added ${title}, with a salary of ${salary} to the list of roles.`)
        });
        viewRoles();
      });
  });
};
// Add Department
function addDepartment() {
  inquirer
    .prompt([
      {
        name: "newDepartment",
        type: "input",
        message: "What is the name of the department you want to add?",
      },
    ])
    .then(function (answer) {
      console.log(answer);
      db.query(`INSERT INTO department SET ?`, {
        name: answer.newDepartment,
      });
      const query = `SELECT * FROM department`;
      db.query(query, function (err, res) {
        if (err) throw err;
        console.log("Department added");
        console.table("All departments:", res)
        startPrompt();
      });
    });
}