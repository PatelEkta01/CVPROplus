from django.core.mail.backends.smtp import EmailBackend
import smtplib

class CustomEmailBackend(EmailBackend):
    def open(self):
        if self.connection:
            return False
        try:
            self.connection = smtplib.SMTP_SSL(self.host, self.port) if self.use_ssl else smtplib.SMTP(self.host, self.port)
            self.connection.ehlo()
            if self.use_tls:
                self.connection.starttls()
                self.connection.ehlo()
            if self.username and self.password:
                self.connection.login(self.username, self.password)
        except Exception:
            self.close()
            raise
        return True
