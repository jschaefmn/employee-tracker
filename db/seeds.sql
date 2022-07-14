INSERT INTO department(department_name)
VALUES("Engineering"), ("Sales"), ("Legal"), ("Marketing"), ("IT");

INSERT INTO role(title, salary, department_id)
VALUES("Engineer", 8500, 1), ("Senior Engineer", 130000, 1), ("CEO", 450000, 3), ("CFO", 350000, 4);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES('Marc-Andre', 'Fleury', 1, 2), ('Luke', 'Anderson', 2, null), ('Alex', 'Ovechkin', 1, 2), ('Kirill', 'Kaprizov', 1, 3), ('Wayne', 'Gretzky', 4, null);