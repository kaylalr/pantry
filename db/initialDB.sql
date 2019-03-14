create table users (
    user_id     serial      not null,
    user_name   varchar(100) not null,
    user_firstname  varchar(100)    not null,
    user_lastname   varchar(100)    not null,
    user_password   varchar(100)    not null,
    user_email      varchar(50)     not null,
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