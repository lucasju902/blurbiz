CREATE SEQUENCE project_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
ALTER TABLE project_id_seq
  OWNER TO postgres;
  
CREATE TABLE public.project
(
   id integer NOT NULL DEFAULT nextval('project_id_seq'), 
   user_id integer, 
   project_name character varying(255),
   created_at timestamp without time zone DEFAULT now(),
   PRIMARY KEY (id), 
   FOREIGN KEY (user_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
) 
WITH (
  OIDS = FALSE
)
;
ALTER TABLE public.project
  OWNER TO postgres;

INSERT INTO public.project (user_id, project_name) VALUES (
	(SELECT id FROM public."user" where email = 'TestUserBase@gmail.com'), 
	'project_name_test'
);