drop table if exists tostudy;
drop table if exists likes;
drop table if exists comments;
drop table if exists resources;
drop table if exists users ;

CREATE TABLE users (
  is_faculty boolean NULL,
  name character varying(255) NULL,
  userid serial NOT NULL,
  primary key (userid)
);

CREATE TABLE resources (
  resourceid serial NOT NULL primary key,
  userid integer,
  recommendation_reasoning text NOT NULL,
  original_recommendation varchar(255) NOT NULL,
  creation_date timestamp default current_timestamp,
  stage character varying(255) NOT NULL,
  content_type character varying(255) NOT NULL,
  description text NOT NULL,
  author_name character varying(255) NOT NULL,
  url character varying(255) NOT NULL ,
  name character varying(255) NOT NULL,
  tags character varying(255) NOT NULL,
  foreign key(userid) references users (userid),
  constraint unique_url unique (url)
);

CREATE TABLE tostudy (
    studyid serial primary key,
  	resourceid integer ,
  	userid integer,
    foreign key (resourceid) references resources (resourceid),
    foreign key (userid) references users (userid)
);

ALTER TABLE tostudy ADD constraint combination unique (resourceid, userid);


CREATE TABLE likes (
    likeid serial primary key,
  	userid integer,
  	resourceid integer, 
    foreign key (userid) references users (userid),
    foreign key (resourceid) references resources (resourceid),
    like_value boolean NOT NULL
);

CREATE TABLE comments (
    commentid serial primary key,
  	userid integer,
  	resourceid integer,
    foreign key (userid) references users (userid),
    foreign key (resourceid) references resources (resourceid),
    comment_text varchar(255) NOT NULL 
);

INSERT INTO users (is_faculty, name) VALUES 
(true, 'Mateusz Krol'), 
(true, 'Matthew Man'),
(true, 'Neill B'),
(true, 'Katie Davis'),
(true, 'Richard Ng'),
(true, 'Aluka Chiama'),
(true, 'Mateusz Krol'),
(false, 'Abdul Rehman Shaikh'),
(false, 'Anna-Zeri Temir'),
(false, 'Christian Sophocleous'),
(false, 'Emmanuel Falola'),
(false, 'Eralia Katsakiori'),
(false, 'Folajimi Akinwale'),
(false, 'Jacob Cutts'),
(false, 'Laura Jamieson'),
(false, 'Elizabeth Vinand'),
(false, 'Mat Batten'),
(false, 'Nobeen Islam'),
(false, 'Owen Dearman'),
(false, 'Roshni Patel'),
(false, 'Saj Sivia'),
(false, 'Soso Ogan'),
(false, 'Temi Labinjo'),
(false, 'Tiffany Wilmot-Simpson'),
(false, 'Zahra Ben Gaied Hassine');
