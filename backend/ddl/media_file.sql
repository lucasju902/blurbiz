CREATE SEQUENCE media_file_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
ALTER TABLE media_file_id_seq
  OWNER TO postgres;
  
CREATE TABLE public.media_file
(
  id integer NOT NULL DEFAULT nextval('media_file_id_seq'::regclass),
  project_id integer,
  path text,
  name character varying(255),
  order_in_project integer DEFAULT 0,
  resolution character varying(20),
  CONSTRAINT media_file_pkey PRIMARY KEY (id),
  FOREIGN KEY (project_id) REFERENCES "project" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE media_file
  OWNER TO postgres;
