def reset_password_html(link: str) -> str:
    return f"""<!doctype html>
<html>
<body style="margin:0;padding:0;background:#eef2f7;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef2f7; border-collapse: collapse;">
    <tr>
        <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 18px 45px rgba(15,23,42,0.12); border-collapse: collapse;">
            <tr>
            <td style="padding:24px 40px;background:linear-gradient(135deg,#0f172a,#1d4ed8);font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
                <p style="margin:0;font-size:12px;line-height:18px;letter-spacing:1.8px;text-transform:uppercase;opacity:0.78;">
                PC Repairment Service
                </p>
                <h1 style="margin:8px 0 0;font-size:30px;line-height:38px;font-weight:700;">
                Ustawienie hasła
                </h1>
            </td>
            </tr>
            <tr>
            <td style="padding:36px 40px 24px;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
                <p style="margin:0 0 12px;font-size:14px;line-height:20px;color:#2563eb;font-weight:bold;letter-spacing:0.4px;">
                Bezpieczny dostęp do konta
                </p>
                <h2 style="margin:0 0 16px;font-size:28px;line-height:36px;color:#0f172a;">
                Wybierz nowe hasło
                </h2>
                <p style="margin:0 0 16px;font-size:16px;line-height:24px;">
                Kliknij poniższy przycisk, aby ustawić nowe hasło do swojego konta. Ten link możesz otrzymać zarówno przy pierwszej aktywacji konta, jak i podczas zmiany hasła.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 8px;background:#f8fafc;border:1px solid #dbe4f0;border-radius:12px; border-collapse: separate;">
                <tr>
                    <td style="padding:18px 20px;font-size:14px;line-height:22px;color:#475569;">
                    Po zapisaniu nowego hasła będziesz mógł bezpiecznie zalogować się do konta i korzystać z jego funkcji.
                    </td>
                </tr>
                </table>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0; border-collapse: collapse;">
                <tr>
                    <td bgcolor="#111827" style="border-radius:10px;">
                    <a href="{link}"
                        style="display:inline-block;padding:14px 24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#ffffff;text-decoration:none;font-weight:bold;">
                        Ustaw nowe hasło
                    </a>
                    </td>
                </tr>
                </table>
                <p style="margin:16px 0 0;font-size:14px;line-height:20px;color:#6b7280;">
                Jeśli nie prosiłeś o ustawienie lub zmianę hasła, możesz zignorować tę wiadomość.
                </p>
                <p style="margin:20px 0 0;font-size:13px;line-height:20px;color:#94a3b8;">
                Jeśli przycisk nie działa, skopiuj i wklej ten link do przeglądarki: <span style="color:#2563eb;">{link}</span>
                </p>
            </td>
            </tr>
            <tr>
            <td style="padding:22px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0 0 6px;font-size:14px;line-height:20px;color:#0f172a;font-weight:bold;">
                PC Repairment Service
                </p>
                <p style="margin:0 0 10px;font-size:13px;line-height:20px;color:#64748b;">
                Dbamy o bezpieczny dostęp do Twojego konta oraz sprawną komunikację dotyczącą zgłoszeń serwisowych.
                </p>
                <p style="margin:0;font-size:12px;line-height:18px;color:#94a3b8;">
                © 2026 PC Repairment Service. All rights reserved.
                </p>
            </td>
            </tr>
        </table>
        </td>
    </tr>
    </table>
</body>
</html>"""


def send_repair_order_creds_html(order_number: str, access_code: str) -> str:
    return f"""<!doctype html>
<html>
<body style="margin:0;padding:0;background:#eef2f7;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef2f7; border-collapse: collapse;">
    <tr>
        <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 18px 45px rgba(15,23,42,0.12); border-collapse: collapse;">
            <tr>
            <td style="padding:24px 40px;background:linear-gradient(135deg,#0f172a,#0f766e);font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
                <p style="margin:0;font-size:12px;line-height:18px;letter-spacing:1.8px;text-transform:uppercase;opacity:0.78;">
                PC Repairment Service
                </p>
                <h1 style="margin:8px 0 0;font-size:30px;line-height:38px;font-weight:700;">
                Dane dostępu do zamówienia
                </h1>
            </td>
            </tr>
            <tr>
            <td style="padding:36px 40px 24px;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
                <p style="margin:0 0 12px;font-size:14px;line-height:20px;color:#0f766e;font-weight:bold;letter-spacing:0.4px;">
                Szybki podgląd statusu naprawy
                </p>
                <h2 style="margin:0 0 16px;font-size:28px;line-height:36px;color:#0f172a;">
                Twoje zamówienie serwisowe
                </h2>
                <p style="margin:0 0 16px;font-size:16px;line-height:24px;">
                Poniżej znajdują się dane dostępu do Twojego zgłoszenia. Za ich pomocą możesz sprawdzić status naprawy bez konieczności logowania do konta.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 18px;background:#f8fafc;border:1px solid #dbe4f0;border-radius:14px; border-collapse: separate;">
                <tr>
                    <td style="padding:24px 22px;">
                    <p style="margin:0 0 6px;font-size:12px;line-height:18px;color:#64748b;text-transform:uppercase;letter-spacing:1.1px;">
                        Numer zamówienia
                    </p>
                    <p style="margin:0 0 18px;font-size:24px;line-height:30px;color:#0f172a;font-weight:700;">
                        {order_number}
                    </p>
                    <p style="margin:0 0 6px;font-size:12px;line-height:18px;color:#64748b;text-transform:uppercase;letter-spacing:1.1px;">
                        Kod dostępu
                    </p>
                    <p style="margin:0;font-size:24px;line-height:30px;color:#0f172a;font-weight:700;">
                        {access_code}
                    </p>
                    </td>
                </tr>
                </table>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 18px;background:#ecfeff;border-left:4px solid #14b8a6; border-collapse: collapse;">
                <tr>
                    <td style="padding:16px 18px;font-size:14px;line-height:22px;color:#155e75;">
                    Zachowaj tę wiadomość. Numer zamówienia i kod dostępu pozwalają otworzyć szczegóły wyłącznie dla tego jednego zgłoszenia.
                    </td>
                </tr>
                </table>
                <p style="margin:0;font-size:14px;line-height:20px;color:#6b7280;">
                Jeśli nie oczekiwałeś tej wiadomości, skontaktuj się z obsługą serwisu.
                </p>
            </td>
            </tr>
            <tr>
            <td style="padding:22px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0 0 6px;font-size:14px;line-height:20px;color:#0f172a;font-weight:bold;">
                PC Repairment Service
                </p>
                <p style="margin:0 0 10px;font-size:13px;line-height:20px;color:#64748b;">
                W tym miejscu przesyłamy najważniejsze informacje potrzebne do śledzenia postępu naprawy bez logowania.
                </p>
                <p style="margin:0;font-size:12px;line-height:18px;color:#94a3b8;">
                © 2026 PC Repairment Service. All rights reserved.
                </p>
            </td>
            </tr>
        </table>
        </td>
    </tr>
    </table>
</body>
</html>"""


def completed_repair_order(order_number: str) -> str:
    return f"""<!doctype html>
<html>
<body style="margin:0;padding:0;background:#eef2f7;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef2f7; border-collapse: collapse;">
    <tr>
        <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 18px 45px rgba(15,23,42,0.12); border-collapse: collapse;">
            <tr>
            <td style="padding:24px 40px;background:linear-gradient(135deg,#14532d,#16a34a);font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
                <p style="margin:0;font-size:12px;line-height:18px;letter-spacing:1.8px;text-transform:uppercase;opacity:0.82;">
                PC Repairment Service
                </p>
                <h1 style="margin:8px 0 0;font-size:30px;line-height:38px;font-weight:700;">
                Naprawa zakończona
                </h1>
            </td>
            </tr>
            <tr>
            <td style="padding:36px 40px 24px;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
                <p style="margin:0 0 12px;font-size:14px;line-height:20px;color:#16a34a;font-weight:bold;letter-spacing:0.4px;">
                Status zamówienia został zaktualizowany
                </p>
                <h2 style="margin:0 0 16px;font-size:28px;line-height:36px;color:#0f172a;">
                Twoje urządzenie jest gotowe do odbioru
                </h2>
                <p style="margin:0 0 16px;font-size:16px;line-height:24px;">
                Informujemy, że naprawa Twojego zamówienia została zakończona. Możesz odebrać urządzenie w naszym punkcie serwisowym.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 18px;background:#f8fafc;border:1px solid #dbe4f0;border-radius:14px; border-collapse: separate;">
                <tr>
                    <td style="padding:24px 22px;">
                    <p style="margin:0 0 6px;font-size:12px;line-height:18px;color:#64748b;text-transform:uppercase;letter-spacing:1.1px;">
                        Numer zamówienia
                    </p>
                    <p style="margin:0;font-size:24px;line-height:30px;color:#0f172a;font-weight:700;">
                        {order_number}
                    </p>
                    </td>
                </tr>
                </table>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 18px;background:#f0fdf4;border-left:4px solid #22c55e; border-collapse: collapse;">
                <tr>
                    <td style="padding:16px 18px;font-size:14px;line-height:22px;color:#166534;">
                    Przyjdź do punktu serwisowego z numerem zamówienia, aby szybko odebrać swoje urządzenie po zakończeniu obsługi.
                    </td>
                </tr>
                </table>
                <p style="margin:0;font-size:14px;line-height:20px;color:#6b7280;">
                Jeśli masz pytania dotyczące odbioru lub szczegółów naprawy, skontaktuj się z naszym serwisem.
                </p>
            </td>
            </tr>
            <tr>
            <td style="padding:22px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0 0 6px;font-size:14px;line-height:20px;color:#0f172a;font-weight:bold;">
                PC Repairment Service
                </p>
                <p style="margin:0 0 10px;font-size:13px;line-height:20px;color:#64748b;">
                Dziękujemy za skorzystanie z naszego serwisu. Cieszymy się, że mogliśmy pomyślnie zakończyć Twoje zamówienie.
                </p>
                <p style="margin:0;font-size:12px;line-height:18px;color:#94a3b8;">
                © 2026 PC Repairment Service. All rights reserved.
                </p>
            </td>
            </tr>
        </table>
        </td>
    </tr>
    </table>
</body>
</html>"""
