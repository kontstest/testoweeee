import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Polityka Prywatności</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ostatnia aktualizacja: {new Date().toLocaleDateString("pl-PL")}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Wprowadzenie</h2>
              <p className="text-muted-foreground">
                Niniejsza Polityka Prywatności opisuje, w jaki sposób zbieramy, wykorzystujemy i chronimy Twoje dane
                osobowe podczas korzystania z naszej platformy do zarządzania eventami i weselami.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Administrator danych</h2>
              <p className="text-muted-foreground">
                Administratorem Twoich danych osobowych jest [Nazwa Firmy], z siedzibą w [Adres]. W sprawach dotyczących
                ochrony danych osobowych możesz skontaktować się z nami pod adresem: [email kontaktowy].
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Jakie dane zbieramy</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>Zbieramy następujące kategorie danych osobowych:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <strong>Dane konta:</strong> adres email, imię, nazwisko (dla klientów i administratorów)
                  </li>
                  <li>
                    <strong>Dane eventów:</strong> nazwa wydarzenia, data, zdjęcia, harmonogram, menu
                  </li>
                  <li>
                    <strong>Dane gości:</strong> zdjęcia przesłane przez gości, odpowiedzi na ankiety, postęp w grze
                    bingo
                  </li>
                  <li>
                    <strong>Dane techniczne:</strong> adres IP, typ przeglądarki, informacje o urządzeniu (tylko w
                    celach bezpieczeństwa)
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Cel przetwarzania danych</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>Twoje dane osobowe przetwarzamy w następujących celach:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Świadczenie usług platformy do zarządzania eventami</li>
                  <li>Umożliwienie gościom dostępu do informacji o evencie</li>
                  <li>Przechowywanie i udostępnianie galerii zdjęć</li>
                  <li>Przeprowadzanie ankiet i gier interaktywnych</li>
                  <li>Zapewnienie bezpieczeństwa i integralności systemu</li>
                  <li>Komunikacja z użytkownikami</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Podstawa prawna przetwarzania</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>Przetwarzamy Twoje dane osobowe na podstawie:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <strong>Umowy:</strong> wykonanie umowy o świadczenie usług (art. 6 ust. 1 lit. b RODO)
                  </li>
                  <li>
                    <strong>Zgody:</strong> w przypadku przesyłania zdjęć i uczestnictwa w ankietach (art. 6 ust. 1 lit.
                    a RODO)
                  </li>
                  <li>
                    <strong>Prawnie uzasadnionego interesu:</strong> zapewnienie bezpieczeństwa systemu (art. 6 ust. 1
                    lit. f RODO)
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Udostępnianie danych</h2>
              <p className="text-muted-foreground">
                Twoje dane osobowe mogą być udostępniane następującym kategoriom odbiorców:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Dostawcom usług hostingowych (Vercel, Supabase)</li>
                <li>Dostawcom usług płatniczych (jeśli dokonujesz płatności)</li>
                <li>Organom państwowym na podstawie obowiązujących przepisów prawa</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                <strong>Nie sprzedajemy</strong> Twoich danych osobowych stronom trzecim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Okres przechowywania danych</h2>
              <p className="text-muted-foreground">
                Twoje dane osobowe przechowujemy przez okres niezbędny do realizacji celów, dla których zostały zebrane:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Dane konta: do momentu usunięcia konta lub wycofania zgody</li>
                <li>Dane eventów: przez czas trwania eventu + 2 lata (lub do momentu usunięcia przez klienta)</li>
                <li>Dane gości: przez czas trwania eventu + 30 dni (lub do momentu usunięcia przez organizatora)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Twoje prawa</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>Masz prawo do:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Dostępu do swoich danych osobowych</li>
                  <li>Sprostowania (poprawiania) swoich danych</li>
                  <li>Usunięcia swoich danych ("prawo do bycia zapomnianym")</li>
                  <li>Ograniczenia przetwarzania danych</li>
                  <li>Przenoszenia danych</li>
                  <li>Wniesienia sprzeciwu wobec przetwarzania</li>
                  <li>Wycofania zgody w dowolnym momencie</li>
                  <li>Wniesienia skargi do organu nadzorczego (UODO)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Pliki cookie</h2>
              <p className="text-muted-foreground">Nasza strona używa wyłącznie niezbędnych plików cookie do:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Zarządzania sesjami użytkowników</li>
                <li>Uwierzytelniania i autoryzacji</li>
                <li>Zapamiętywania preferencji językowych</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Nie używamy plików cookie do śledzenia, analityki ani reklam.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Bezpieczeństwo danych</h2>
              <p className="text-muted-foreground">
                Stosujemy odpowiednie środki techniczne i organizacyjne w celu ochrony Twoich danych osobowych przed
                nieuprawnionym dostępem, utratą, zniszczeniem lub zmianą. Wszystkie dane są przesyłane za pomocą
                szyfrowanego połączenia HTTPS, a hasła są przechowywane w formie zaszyfrowanej.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Zmiany w Polityce Prywatności</h2>
              <p className="text-muted-foreground">
                Zastrzegamy sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności. O wszelkich zmianach
                poinformujemy użytkowników poprzez powiadomienie na stronie lub email.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Kontakt</h2>
              <p className="text-muted-foreground">
                W przypadku pytań dotyczących niniejszej Polityki Prywatności lub sposobu przetwarzania Twoich danych
                osobowych, skontaktuj się z nami:
              </p>
              <ul className="list-none space-y-1 text-muted-foreground mt-2">
                <li>
                  <strong>Email:</strong> privacy@example.com
                </li>
                <li>
                  <strong>Adres:</strong> [Adres firmy]
                </li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
