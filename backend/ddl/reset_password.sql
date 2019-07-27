CREATE SEQUENCE reset_password_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
ALTER TABLE reset_password_id_seq
  OWNER TO postgres;
  
CREATE TABLE public.reset_password
(
  id integer NOT NULL DEFAULT nextval('reset_password_id_seq'::regclass),
  user_id integer,
  code character varying(40),
  CONSTRAINT reset_password_pkey PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE reset_password
  OWNER TO postgres;

INSERT INTO public.reset_password (user_id, code) VALUES (
	(SELECT id FROM public."user" where email = 'TestUserBasePassword@gmail.com'), 
	'9930633a-6ce8-4019-83fb-f2d6e74c7d50'
);