const inquirer = require('inquirer');
const express = require('express');
const db = require('./db/connection');
const cTable = require('console.table');
const { start } = require('repl');

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
          'View Employees By Role',
          'View Employees By Department',
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
        case 'View Employees By Role':
          viewRoles();
          break;
        case 'View Employees By Department':
          viewEmployeeDepartments();
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
  const query = "SELECT * FROM employee";

  db.query(query, function (err, res) {
    if (err) throw err;
    console.log(res.length + " employees found");
    console.table("All Employees:", res);
    startPrompt();
  });
}

// view departments
function viewDepartments() {
  const query = "SELECT * FROM department";
  db.query(query, function(err, res) {
    if (err) throw err;
    console.table("All Departments:", res);
    startPrompt();
  });
}


// View Employees By Role
function viewRoles() {
  const query = "SELECT * FROM role";
  db.query(query, function (err, res) {
    if (err) throw err;
    console.table('All Roles:', res);
    startPrompt();
  });
}
// View Employees By Department
function viewEmployeeDepartments() {
  const query = "SELECT * FROM department";
  db.query(query, function (err, res) {
    if (err) throw err;
    console.table("All Roles:", res);
    startPrompt();
  })
}
// Update an Employee
function updateEmployee() {
  db.query("SELECT * FROM employee", function (err, result) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "employeeName",
          type: "list",
          message: "Which employee do you want to update?",
          choices: function () {
            let employeeArray = [];
            result.forEach((result) => {
              employeeArray.push(result.last_name);
            });
            return employeeArray
          },
        },
      ])
      .then(function (answer) {
        console.log(answer);
        const name = answer.employeeName;

        db.query("SELECT * FROM role", function (err, res) {
          inquirer
            .prompt([
              {
                name: "role",
                type: "list",
                message: "What would you like their new role to be?",
                choices: function () {
                  let roleArray = [];
                  res.forEach((res) => {
                    roleArray.push(res.title);
                  });
                  return roleArray;
                },
              },
            ])
            .then(function (roleAnswer) {
              const role = roleAnswer.role;
              console.log(role);
              db.query("SELECT * FROM role where TITLE = ?",
                [role],
                function (err, res) {
                  if (err) throw err;
                  let roleId = res[0].id;

                  let query = "UPDATE employee SET role_id = ? WHERE last_name = ?";
                  let values = [parseInt(roleId), name];

                  db.query(
                    query, values, function (err, res, fields) {
                      console.log(
                        `You have updated ${name}'s role to ${role}.`
                      );
                    }
                  );
                  viewRoles();
                });
            });
        });
      });
  });
}
// Add Employee
function addEmployee() {
  db.query("SELECT * FROM role", function (err, res) {
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
          "INSERT INTO employee SET ?",
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
  db.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: "new_role",
          type: "input",
          message: "What is the name of the role you would like to add?",
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary for this role?",
        },
        {
          name: "Department",
          type: "list",
          choices: function () {
            const deptArry = [];
            for (let i = 0; i < res.length; i++) {
              deptArry.push(res[i].name);
            }
            return deptArry;
          },
        },
      ])
      .then(function (answer) {
        let department_id;
        for (let a = 0; a < res.length; a++) {
          if (res[a].name == answer.Department) {
            department_id = res[a].id;
          }
        }
        db.query(
          "INSERT INTO role SET ?",
          {
            title: answer.new_role,
            salary: answer.salary,
            department_id: department_id,
          },
          function (err, res) {
            if (err) throw err;
            console.log("Your new role has been added!");
            console.table("All Roles:", res);
            startPrompt();
          }
        );
      });
  });
}
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
      db.query("INSERT INTO department SET ?", {
        name: answer.newDepartment,
      });
      const query = "SELECT * FROM department";
      db.query(query, function (err, res) {
        if (err) throw err;
        console.log("Department added");
        console.table("All departments:", res)
        startPrompt();
      });
    });
}