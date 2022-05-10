drop table if exists resources
drop table if exists users 

CREATE TABLE resources (
  recommendation_reasoning character varying(255) NOT NULL,
  original_recommendation integer NOT NULL,
  userid,
  creation_date timestamp without time zone NOT NULL,
  stage character varying(255) NOT NULL,
  content_type character varying(255) NOT NULL,
  description text NOT NULL,
  author_name character varying(255) NOT NULL,
  url character varying(255) NOT NULL,
  name character varying(255) NOT NULL,
  resourceid serial NOT NULL,
  primary key (resourceid),
  foreign key (userid) references users (userid)
);

CREATE TABLE users (
  is_faculty boolean NULL,
  name character varying(255) NULL,
  userid serial NOT NULL,
  primary key (userid)
);

CREATE TABLE tostudy (
    studyid serial primary key,
    foreign key (resourceid) references resources (resourceid),
    foreign key (userid) references users (userid)
);

CREATE TABLE tags (
    tagid serial primary key,
    foreign key (resourceid) references resources (resourceid),
    tag varchar(255) NOT NULL
);

CREATE TABLE likes (
    likeid serial primary key,
    foreign key (userid) references users (userid),
    foreign key (resourceid) references resources (resourceid),
    like_value boolean NOT NULL
);

CREATE TABLE comments (
    commentid serial primary key,
    foreign key (userid) references users (userid),
    foreign key (resourceid) references resources (resourceid),
    comment_text varchar(255) NOT NULL 
);