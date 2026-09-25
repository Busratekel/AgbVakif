using System.Text.RegularExpressions;

namespace AgbVakif.Api.Services;

public static class TurkishId
{
    public static string NormalizeTc(string? value) =>
        Regex.Replace(value ?? "", @"\D", "");

    public static string NormalizePhone(string? value)
    {
        var digits = Regex.Replace(value ?? "", @"\D", "");
        if (digits.StartsWith("90") && digits.Length == 12)
        {
            digits = digits[2..];
        }

        if (digits.Length == 10 && digits.StartsWith('5'))
        {
            digits = "0" + digits;
        }

        return digits;
    }

    /// <summary>T.C. kimlik numarası algoritmik doğrulama (11 hane + kontrol basamakları).</summary>
    public static bool ValidateTCKN(string? tcno)
    {
        if (string.IsNullOrWhiteSpace(tcno)) return false;

        var tc = NormalizeTc(tcno);
        if (tc.Length != 11 || !long.TryParse(tc, out _) || tc[0] == '0')
        {
            return false;
        }

        var digits = tc.Select(c => c - '0').ToArray();

        var oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        var evenSum = digits[1] + digits[3] + digits[5] + digits[7];

        // C#’te % negatif sonuç verebilir; 0–9 aralığına çek
        var digit10 = ((oddSum * 7) - evenSum) % 10;
        if (digit10 < 0) digit10 += 10;
        if (digit10 != digits[9]) return false;

        if (digits.Take(10).Sum() % 10 != digits[10]) return false;

        return true;
    }

    public static bool IsValidTc(string tc) => ValidateTCKN(tc);

    public static bool IsValidMobile(string phone) =>
        Regex.IsMatch(phone, @"^05\d{9}$");

    public static string MaskTc(string tc) =>
        tc.Length == 11 ? $"{tc[..2]}*******{tc[^2..]}" : tc;

    public static string MaskPhone(string phone)
    {
        if (phone.Length < 4) return phone;
        return $"{phone[..3]}** *** ** {phone[^2..]}";
    }
}
