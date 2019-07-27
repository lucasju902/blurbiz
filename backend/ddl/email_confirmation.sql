CREATE SEQUENCE email_confirmation_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
ALTER TABLE email_confirmation_id_seq
  OWNER TO postgres;
  
CREATE TABLE public.email_confirmation
(
  id integer NOT NULL DEFAULT nextval('email_confirmation_id_seq'::regclass),
  user_id integer,
  code character varying(40),
  CONSTRAINT email_confirmation_pkey PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE email_confirmation
  OWNER TO postgres;

INSERT INTO public.email_confirmation (user_id, code) VALUES (
	(SELECT id FROM public."user" where email = 'TestUserBase@gmail.com'), 
	'68080683-37ea-4f7f-ae64-7476312222d8'
);