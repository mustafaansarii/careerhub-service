package com.docservice.careerhub.service;

import com.samskivert.mustache.Mustache;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LatexMergeService {

    private final Mustache.Compiler compiler = Mustache.compiler()
            .withEscaper(LatexMergeService::escapeLatex)
            .defaultValue("");

    public String merge(String templateLatex, Map<String, Object> data) {
        Map<String, Object> context = new HashMap<>(data == null ? Map.of() : data);
        for (Map.Entry<String, Object> e : new HashMap<>(context).entrySet()) {
            if (e.getValue() instanceof List<?> list) {
                context.put("has" + capitalize(e.getKey()), !list.isEmpty());
            }
        }
        return compiler.compile(templateLatex).execute(context);
    }

    private static String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    static String escapeLatex(String raw) {
        if (raw == null) return "";
        StringBuilder sb = new StringBuilder(raw.length() + 16);
        for (int i = 0; i < raw.length(); i++) {
            char c = raw.charAt(i);
            switch (c) {
                case '\\' -> sb.append("\\textbackslash{}");
                case '&', '%', '$', '#', '_', '{', '}' -> sb.append('\\').append(c);
                case '~' -> sb.append("\\textasciitilde{}");
                case '^' -> sb.append("\\textasciicircum{}");
                default -> sb.append(c);
            }
        }
        return sb.toString();
    }
}
