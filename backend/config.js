module.exports = {
	dbConfig: {
        	user: 'postgres',
	        password: 'postgres',
        	database: 'blurbiz',
	        port: 5432
	},
	mailConfig: {
		auth: {
			user: 'no.reply.blurbiz@gmail.com',
			pass: 'td#blurbiz123'
		},
		template_signup_confirmation: {
		        'from': 'no.reply.blurbiz@gmal.com',
		        'subject': 'Signup confirmation',
		        'html': '<b>To finish registration follow the link:</b> link_placeholder'
		},
		template_reset_password: {
			'from': 'no.reply.blurbiz@gmal.com',
                        'subject': 'Reset password',
                        'html': '<b>To reset password follow the link:</b> link_placeholder'
		}
	},
	tokenKey: 'secret_token_key',
	s3_config: {
		BUCKET_NAME: "blurbiz-media",
		ACCESS_KEY: "AKIAJ76FOT7IZL4K5B5A",
		SECRECT_KEY: "WcaFbktZtKVLLA1qbmk2UsDaBDczC4oUFWLw9ell",
	}
}
