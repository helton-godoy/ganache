ui:
	cd ui && npm install && npm run build

install:
	# Instalação do Backend (Stub)
	install -D -m 0755 target/release/ganache-api $(DESTDIR)/usr/sbin/ganache-api
	# Instalação do Frontend
	mkdir -p $(DESTDIR)/usr/share/ganache/www
	cp -r ui/dist/* $(DESTDIR)/usr/share/ganache/www/