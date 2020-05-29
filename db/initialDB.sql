create table users (
    user_id     serial      not null,
    user_name   varchar(100) not null,
    user_firstname  varchar(100)    not null,
    user_lastname   varchar(100)    not null,
    user_password   varchar(100)    not null,
    primary key (user_id)
);

create table food_groups (
    foodgroup_id    serial      not null,
    foodgroup_name  varchar(100)    not null,
    user_id         int,
    public          boolean,
    description     text,
    primary key (foodgroup_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

create table quantity_types (
    quantity_type_id    serial      not null,
    quantity_type_name  varchar(100)    not null,
    primary key (quantity_type_id)
);

create table foods (
    food_id     serial  not null,
    food_name   varchar(100)    not null,
    user_id     int         not null,
    foodgroup_id    int     not null,
    quantity_num        int     not null,
    quantity_type_id       int     not null,
    expiration      date,
    description     text,
    primary key (food_id),
    FOREIGN key (user_id) REFERENCES users(user_id),
    FOREIGN key (foodgroup_id) REFERENCES food_groups(foodgroup_id),
    foreign key (quantity_type_id) REFERENCES quantity_types(quantity_type_id)
);

insert into food_groups (
    foodgroup_id,
    foodgroup_name,
    public
)values (
    default,
    'Bread',
    'TRUE'
);

insert into food_groups (
    foodgroup_id,
    foodgroup_name,
    public
)values (
    default,
    'Meat',
    'TRUE'
);

insert into quantity_types values(
    default,
    'Pound(s)'
);

insert into foods values (
    default,
    'Hamburger',
    1,
    2,
    4,
    1,
    '2018-09-09',
    'ground hamburger'
);

create table recipes (
    recipe_id       serial  not null,
    recipe_name     varchar(100)    not null,
    author      varchar(100),
    user_id     int     not null,
    primary key (recipe_id),
    foreign key (user_id) REFERENCES users(user_id)
);

insert into recipes values (
    default,
    'Hamburgers',
    'Kayla Hellbusch',
    1
);

create table ingredients (
    ingredient_id   serial  not null,
    recipe_id       int     not null,
    ingredient_name varchar(100)    not null,
    quantity_num     numeric(4,2)     not null,
    quantity_type  int     not null,
    primary key (ingredient_id),
    foreign key (recipe_id) REFERENCES recipes(recipe_id),
    foreign key (quantity_type) REFERENCES quantity_types(quantity_type_id)
);

create table instructions (
    instruction_id      serial  not null,
    recipe_id   int     not null,
    directions  text    not null,
    primary key (instruction_id),
    foreign key (recipe_id) REFERENCES recipes(recipe_id)
);

insert into ingredients values (
    default,
    1,
    'Butter',
    0.75,
    4
);

insert into ingredients values (
    default,
    1,
    'Sugar',
    0.75,
    4
);

insert into ingredients values (
    default,
    1,
    'Brown Sugar',
    0.75,
    4
);

insert into ingredients values (
    default,
    1,
    'Eggs',
    2,
    5
);

insert into ingredients values (
    default,
    1,
    'Vanilla',
    1,
    3
);

insert into ingredients values (
    default,
    1,
    'Flour',
    2.25,
    4
);

insert into ingredients values (
    default,
    1,
    'Baking Soda',
    1,
    3
);

insert into ingredients values (
    default,
    1,
    'Salt',
    1,
    3
);

insert into ingredients values (
    default,
    1,
    'Chocolate Chips',
    02.00,
    3
);