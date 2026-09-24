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

    public static bool IsValidTc(string tc)
    {
        if (tc.Length != 11 || tc[0] == '0' || !tc.All(char.IsDigit))
        {
            return false;
        }

        var d = tc.Select(c => c - '0').ToArray();
        var oddSum = d[0] + d[2] + d[4] + d[6] + d[8];
        var evenSum = d[1] + d[3] + d[5] + d[7];
        var digit10 = ((oddSum * 7) - evenSum) % 10;
        if (digit10 < 0) digit10 += 10;
        if (d[9] != digit10) return false;
        return d[10] == d.Take(10).Sum() % 10;
    }

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
