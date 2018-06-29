/*
   _kjservlet_db_plugin_.js

   Copyright 2017 Keijack

   This Source Code Form is subject to the terms of the GPL v.3.0. or Apache License v.2.0 (Need permission)  
   
   If a copy of the Permitted license was not distributed with this file, You can obtain one at following links.
   
   GPL: https://www.gnu.org/licenses/gpl.html
   
   Apache License: http://www.apache.org/licenses/LICENSE-2.0
*/

var $validator = (function () {

    function validate(obj, rules) {
        var result = {};
        for (var fieldName in rules) {
            var fieldRules = _kj_util_.array.getArray(rules[fieldName]);
            var msgs = validateField(obj, fieldName, fieldRules);
            if (msgs) result[fieldName] = msgs;
        }
        if (Object.keys(result).length) return result;
        return false;
    }

    function validateField(obj, field, rules) {
        var val = obj[field];
        var msgs = [];
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            var msg;
            if (rule.rule === "notNull" || rule.rule === "required") {
                msg = validateNotNull(val, rule);
            } else if (rule.rule === "length") {
                msg = validateLength(val, rule);
            } else if (rule.rule === "number") {
                msg = validateNumber(val, rule);
            } else if (rule.rule === "equalTo") {
                msg = validateEqualTo(val, obj, rule);
            } else if (rule.rule === "regex") {
                msg = validateRegex(val, rule);
            } else if (typeof rule.rule === "function") {
                msg = validateFunction(val, rule);
            } else {
                $log.w("rule(" + rule.rule + ") is not supported yet.");
            }
            if (msg) msgs.push(msg);
        }
        if (msgs.length) return msgs;
        else return false;
    }

    function validateFunction(val, rule) {
        if (typeof val === "undefined" || val === null) return false;
        var valid = rule.rule(val);
        if (valid) return false;
        return rule.message;
    }

    function validateRegex(val, rule) {
        if (typeof val === "undefined" || val === null) return false;
        var pattern = rule.pattern || rule.regex || ".*";
        var regex = new RegExp(pattern);
        if (regex.test(val)) return false;
        if (rule.message) return rule.message;
        return "This field must be matched with regular expression /" + pattern + "/";
    }

    function validateEqualTo(val, obj, rule) {
        if (val === obj[rlue.target]) return false;
        else return rule.message.replaceAll("{target}", rule.target);
    }

    function validateNumber(val, rule) {
        if (typeof val === "undefined" || val === null) return false;
        var min = rule.min || 0;
        var max = rule.max || Number.POSITIVE_INFINITY;
        var num = Number.parseFloat(val);
        if (!Number.isNaN(num) && num >= min && num <= max) return false;
        if (rule.message) return rule.message.replaceAll("{min}", rule.min).replaceAll("{max}", rule.max);
        var defaultMsg = "This field must be a number.";
        if (rule.min) defaultMsg += " It must be greater than " + rule.min + ". ";
        if (rule.max) defaultMsg += " And it must be less then " + rule.max + ". ";
        return defaultMsg;
    }

    function validateLength(val, rule) {
        if (typeof val === "undefined" || val === null) return false;
        var min = rule.min || 0;
        var max = rule.max || Number.POSITIVE_INFINITY;
        if (val.length && val.length >= min && val.length <= max) return false;
        if (rule.message) return rule.message.replaceAll("{min}", rule.min).replaceAll("{max}", rule.max);
        var defaultMsg = "The length of this field must ";
        if (rule.min) defaultMsg += " be greater than " + rule.min;
        if (rule.max) {
            if (rule.min) defaultMsg += " and";
            else defaultMsg += " be";
            defaultMsg += " less then " + rule.max;
        }
        return defaultMsg + ". ";
        return "The length of this field must between " + min + " and " + max
    }

    function validateNotNull(val, rule) {
        if (typeof val === "undefined" || val === null) {
            if (rule.message) return rule.message;
            else return "This field is required.";
        } else return false;
    }

    return {
        hasError: validate,
        validate: function (obj, rules, callback) {
            var error = validate(obj, rules);
            callback(error);
        }
    }

})();