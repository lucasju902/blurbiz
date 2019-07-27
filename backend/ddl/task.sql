CREATE SEQUENCE task_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
ALTER TABLE task_id_seq
  OWNER TO postgres;
  
CREATE TABLE public.task
(
  id integer NOT NULL DEFAULT nextval('task_id_seq'::regclass),
  project_id integer,
  scheduled_start_date timestamp without time zone,
  is_finished boolean DEFAULT false,
  is_in_progress boolean DEFAULT false,
  start_date timestamp without time zone,
  target_social_network character varying(255),
  title character varying(255),
  description character varying(255),
  CONSTRAINT task_pkey PRIMARY KEY (id),
  FOREIGN KEY (project_id) REFERENCES "project" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE task
  OWNER TO postgres;
