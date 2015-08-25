(function($) {
    "use strict";
    var PAFB_SURVEY = {
        common: {
            /**
         * Init common scripts
         */
            init: function() {
                // Check if feedback questions are defined in the current page
                if (typeof pafb_survey_instances !== "undefined") {
                    $.each(pafb_survey_instances, function(i, dd) {
                        var arr_questions = [];
                        // get all questions
                        $.each(dd.pafb_questions, function(i, d) {
                            if (typeof d.question !== "undefined" || typeof d.confirmation !== "undefined") {
                                d.column = i;
                                arr_questions.push(d);
                            }
                        });
                        // Set questions fields
                        $.each(arr_questions.reverse(), function(i, d) {
                            PAFB_SURVEY.common.survey_question_tpl(d.type, d, i, dd.pafb_survey_id, arr_questions.length);
                        });
                        // Set default progress
                        var size = $("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li").size();
                        var progress = Math.floor(100 / size * 1);
                        $("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-bar").css("width", progress + "%");
                        // Hide all items except the first child
                        $("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li").each(function(e) {
                            if (e != 0) $(this).hide();
                            $("div[id=pafb-feedback-form][data-pafb-id=" + dd.pafb_survey_id + "] .prev").hide();
                            $("div[id=pafb-feedback-form][data-pafb-id=" + dd.pafb_survey_id + "] .done").hide();
                        });
                        // Feedback form navigation Next
                        $("div[id=pafb-feedback-form][data-pafb-id=" + dd.pafb_survey_id + "] .next").click(function() {
                            var $current_elem = $("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:visible");
                            var has_required = $current_elem.data("required");
                            var type = $current_elem.data("type");
                            var $progress_bar = $("div[id=pafb-feedback-form][data-pafb-id=" + dd.pafb_survey_id + "]").find("div[id=pafb-bar]");
                            // Validate current before proceed
                            if (PAFB_SURVEY.common.survey_validate_answer(type, has_required, $current_elem)) {
                                if ($("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:visible").next().length != 0) {
                                    $("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:visible").next().show().prev().hide();
                                    $("div[id=pafb-feedback-form][data-pafb-id=" + dd.pafb_survey_id + "] .prev").show();
                                } else {
                                    $("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:visible").hide();
                                    $("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:first").show();
                                }
                                if ($("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:last").prev().is(":visible")) {
                                    $("div[id=pafb-feedback-form][data-pafb-id=" + dd.pafb_survey_id + "] .next").hide();
                                    $("div[id=pafb-feedback-form][data-pafb-id=" + dd.pafb_survey_id + "] .done").show();
                                }
                                var progress = $("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:visible").data("progress");
                                $progress_bar.css("width", progress + "%");
                            }
                            return false;
                        });
                        // Feedback form naigation Previous
                        $("div[id=pafb-feedback-form][data-pafb-id=" + dd.pafb_survey_id + "] .prev").click(function() {
                            var $progress_bar = $("div[id=pafb-feedback-form][data-pafb-id=" + dd.pafb_survey_id + "]").find("div[id=pafb-bar]");
                            if ($("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:visible").prev().length != 0) {
                                $("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:visible").prev().show().next().hide();
                            } else {
                                $("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:visible").hide();
                                $("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:last").show();
                            }
                            if ($("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:first").is(":visible")) {
                                $("div[id=pafb-feedback-form][data-pafb-id=" + dd.pafb_survey_id + "] .prev").hide();
                            }
                            if ($("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:not(:last)").is(":visible")) {
                                $("div[id=pafb-feedback-form][data-pafb-id=" + dd.pafb_survey_id + "] .next").show();
                                $("div[id=pafb-feedback-form][data-pafb-id=" + dd.pafb_survey_id + "] .done").hide();
                            }
                            var progress = $("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:visible").data("progress");
                            $progress_bar.css("width", progress + "%");
                            return false;
                        });
                        // Feedback form navigation Finish 
                        $("div[id=pafb-feedback-form][data-pafb-id=" + dd.pafb_survey_id + "] .done").click(function() {
                            var $current_elem = $("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:visible");
                            var has_required = $current_elem.data("required");
                            var type = $current_elem.data("type");
                            // Validate current before proceed
                            if (PAFB_SURVEY.common.survey_validate_answer(type, has_required, $current_elem)) {
                                if ($("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:visible").next().length != 0) {
                                    $("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:visible").next().show().prev().hide();
                                } else {
                                    $("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:visible").hide();
                                    $("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:first").show();
                                }
                                $("div[id=pafb-feedback-form][data-pafb-id=" + dd.pafb_survey_id + "] .next").hide();
                                $("div[id=pafb-feedback-form][data-pafb-id=" + dd.pafb_survey_id + "] .done").hide();
                                $("div[id=pafb-feedback-form][data-pafb-id=" + dd.pafb_survey_id + "] .prev").hide();
                                var items = $("div[data-pafb-id=" + dd.pafb_survey_id + "] #pafb-survey-questions ul.items > li:visible").parent("ul.items").parent("div[id=pafb-survey-questions]").find("ul[class=items] > li");
                                var $progress_bar = $("div[id=pafb-feedback-form][data-pafb-id=" + dd.pafb_survey_id + "]").find("div[id=pafb-bar]");
                                $progress_bar.css("width", "100%");
                                // Save feedbacks 
                                PAFB_SURVEY.common.survey_feedbacks_save(items, dd.pafb_survey_id);
                            }
                            return false;
                        });
                    });
                }
            },
            /**
         * Sets the template questions fields
         * 
         * @param  String   type  Type of question field
         * @param  Object   data  Bind object data
         * @param  Integer   i    Question index number
         */
            survey_question_tpl: function(type, data, i, survey_id, size) {
                var $survey_questions_elem = $("#pafb-feedback-form[data-pafb-id=" + survey_id + "] #pafb-survey-questions ul.items");
                var tpl = [];
                var has_required = typeof data.required !== "undefined" ? true : false;
                var progress = Math.floor(100 / size * (i + 1));
                switch (type) {
                  case "positive-negative":
                    tpl.push([ '<li data-progress="' + progress + '" data-type="' + type + '" data-required="' + has_required + '" data-column="' + data.column + '" >', '<span class="pafb-survey-question">' + data.question + "</span>", "<ul>", '<li><input type="radio" name="pafb_feedbacks[pafb_answer][' + i + "][" + type + ']" value="0" id="' + type + "_" + i + '_0"/> <label for="' + type + "_" + i + '_0">' + data.positive + "</label></li>", '<li><input type="radio" name="pafb_feedbacks[pafb_answer][' + i + "][" + type + ']" value="1" id="' + type + "_" + i + '_1"/> <label for="' + type + "_" + i + '_1">' + data.negative + "</label></li>", "</ul>", "</li>" ].join(""));
                    break;

                  case "choice":
                    var choices = [];
                    choices.push("<ul>");
                    for (var a = 0; a < data.choices.length; a++) {
                        if (typeof data.multiple_choice !== "undefined" && data.multiple_choice == 1) {
                            choices.push('<li><input type="checkbox" name="pafb_feedbacks[pafb_answer][' + i + "][" + type + '][]" value="' + data.choices[a] + '" id="' + type + "_" + i + "_" + a + '" /> <label for="' + type + "_" + i + "_" + a + '">' + data.choices[a] + "</label></li>");
                        } else {
                            choices.push('<li><input type="radio" name="pafb_feedbacks[pafb_answer][' + i + "][" + type + ']" value="' + data.choices[a] + '" id="' + type + "_" + i + "_" + a + '"/>  <label for="' + type + "_" + i + "_" + a + '">' + data.choices[a] + "</label></li>");
                        }
                    }
                    choices.push("</ul>");
                    tpl.push([ '<li data-progress="' + progress + '" data-type="' + type + '" data-required="' + has_required + '" data-column="' + data.column + '" >', '<span class="pafb-survey-question">' + data.question + "</span>", choices.join(""), "</li>" ].join(""));
                    break;

                  case "rating":
                    var rating_range = [];
                    rating_range.push('<ul class="pafb-rating-karma">');
                    rating_range.push("<li><span>" + data.negative + "</span></li>");
                    rating_range.push("<li><span>" + data.positive + "</span></li>");
                    rating_range.push("</ul>");
                    rating_range.push('<ul class="pafb-rating-items">');
                    for (var a = 0; a < data.rating_range; a++) {
                        rating_range.push('<li><input type="radio" name="pafb_feedbacks[pafb_answer][' + i + "][" + type + ']" value="' + (a + 1) + '" id="' + type + "_" + i + "_" + a + '" /> <label for="' + type + "_" + i + "_" + a + '">' + (a + 1) + "</label></li>");
                    }
                    rating_range.push("</ul>");
                    tpl.push([ '<li data-progress="' + progress + '" data-type="' + type + '" data-required="' + has_required + '" data-column="' + data.column + '" >', '<span class="pafb-survey-question">' + data.question + "</span>", rating_range.join(""), "</li>" ].join(""));
                    break;

                  case "email":
                    tpl.push([ '<li data-progress="' + progress + '" data-type="' + type + '" data-required="' + has_required + '" data-column="' + data.column + '" >', '<span class="pafb-survey-question">' + data.question + "</span>", '<input type="text" name="pafb_feedbacks[pafb_answer][' + i + "][" + type + ']" placeholder="' + data.placeholder_text + '"/>', "</li>" ].join(""));
                    break;

                  case "singlefield":
                    tpl.push([ '<li data-progress="' + progress + '" data-type="' + type + '" data-required="' + has_required + '" data-column="' + data.column + '" >', '<span class="pafb-survey-question">' + data.question + "</span>", '<input type="text" name="pafb_feedbacks[pafb_answer][' + i + "][" + type + ']" placeholder="' + data.placeholder_text + '"/>', "</li>" ].join(""));
                    break;

                  case "multiplefield":
                    tpl.push([ '<li data-progress="' + progress + '" data-type="' + type + '" data-required="' + has_required + '" data-column="' + data.column + '" >', '<span class="pafb-survey-question">' + data.question + "</span>", '<textarea name="pafb_feedbacks[pafb_answer][' + i + "][" + type + ']" placeholder="' + data.placeholder_text + '"></textarea>', "</li>" ].join(""));
                    break;

                  case "confirmation":
                    tpl.push([ '<li style="display:none;" data-progress="' + progress + '" data-type="' + type + '" data-required="' + has_required + '" data-column="' + data.column + '" >', '<span class="pafb-survey-question">' + data.confirmation + "</span>", "</li>" ].join(""));
                    break;
                }
                $survey_questions_elem.append(tpl.join(""));
            },
            /**
         * Validates Answers before next
         * 
         * @param  String  type         Type of Question 
         * @param  Boolean has_required Checks validation has required
         * @param  Dom     elem         Current item element
         * @return Boolean              
         */
            survey_validate_answer: function(type, has_required, $elem) {
                switch (type) {
                  case "positive-negative":
                    if (has_required && $elem.find("input[type=radio]:checked").size() <= 0) {
                        return false;
                    }
                    break;

                  case "choice":
                    if (has_required && ($elem.find("input[type=radio]:checked").size() <= 0 && $elem.find("input[type=checkbox]:checked").size() <= 0)) {
                        return false;
                    }
                    break;

                  case "rating":
                    if (has_required && $elem.find("input[type=radio]:checked").size() <= 0) {
                        return false;
                    }
                    break;

                  case "email":
                    // has required and field is empty and invalid email format
                    if (has_required && ($elem.find("input[type=text]").val() == "" || !$elem.find("input[type=text]").validEmail())) {
                        return false;
                    }
                    break;

                  case "singlefield":
                    if (has_required && $elem.find("input[type=text]").val() == "") {
                        return false;
                    }
                    break;

                  case "multiplefield":
                    if (has_required && $elem.find("textarea").val() == "") {
                        return false;
                    }
                    break;
                }
                $elem.attr("has-answer", true);
                return true;
            },
            /**
         * Save feedbacks
         * 
         * @param  DOM $survey_elem_form Survey form element
         */
            survey_feedbacks_save: function($survey_elem_form, pafb_survey_ID) {
                var feedbacks = {};
                $.each($survey_elem_form, function() {
                    var $elem = $(this);
                    var type = $elem.data("type");
                    var column = $elem.data("column");
                    console.log(column);
                    switch (type) {
                      case "positive-negative":
                        feedbacks[column] = $elem.find("input[type=radio]:checked").val();
                        break;

                      case "choice":
                        if ($elem.find("input[type=radio]:checked").size() > 0) {
                            feedbacks[column] = $elem.find("input[type=radio]:checked").val();
                        } else if ($elem.find("input[type=checkbox]:checked").size() > 0) {
                            var checkedValues = $elem.find("input[type=checkbox]:checked").map(function() {
                                return this.value;
                            }).get();
                            feedbacks[column] = checkedValues.join(",");
                        }
                        break;

                      case "rating":
                        feedbacks[column] = $elem.find("input[type=radio]:checked").val();
                        break;

                      case "email":
                        feedbacks[column] = $elem.find("input[type=text]").val();
                        break;

                      case "singlefield":
                        feedbacks[column] = $elem.find("input[type=text]").val();
                        break;

                      case "multiplefield":
                        feedbacks[column] = $elem.find("textarea").val();
                        break;
                    }
                });
                var post_ID = parseInt($("div[data-pafb-id=" + pafb_survey_ID + "]").data("post-id"));
                var is_shortcode = parseInt($("div[data-pafb-id=" + pafb_survey_ID + "]").data("pafb-shortcode"));
                // Insert to comment table
                $.post(pafb_ajax_url, {
                    action: "pafb_save_feedback",
                    fb: feedbacks,
                    survey_id: pafb_survey_ID,
                    post_ID: post_ID,
                    is_shortcode: is_shortcode
                }).error(function(e) {
                    console.log(e);
                });
            }
        }
    };
    // The routing fires all common scripts, followed by the page specific scripts.
    // Add additional events for more control over timing e.g. a finalize event
    var UTIL = {
        fire: function(func, funcname, args) {
            var namespace = PAFB_SURVEY;
            funcname = funcname === undefined ? "init" : funcname;
            if (func !== "" && namespace[func] && typeof namespace[func][funcname] === "function") {
                namespace[func][funcname](args);
            }
        },
        loadEvents: function() {
            UTIL.fire("common");
            $.each(document.body.className.replace(/-/g, "_").split(/\s+/), function(i, classnm) {
                UTIL.fire(classnm);
            });
        }
    };
    // Shuffle Array
    $.fn.shuffle = function() {
        return this.each(function() {
            var items = $(this).children().clone(true);
            return items.length ? $(this).html($.shuffle(items)) : this;
        });
    };
    $.shuffle = function(arr) {
        for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], 
        arr[i] = arr[j], arr[j] = x) ;
        return arr;
    };
    /**
 * ValidEmail 
 * @author Andrew Chalkley
 * @link  https://github.com/chalkers/validEmail
 */
    $.fn.validEmail = function(options) {
        options = options || {};
        var on = options.on;
        var success = options.success || function() {};
        var failure = options.failure || function() {};
        var testInitially = options.testInitially || false;
        var $input = $(this);
        function check($input) {
            if ($input.is("input,textarea")) {
                var emailRegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
                return emailRegExp.test($input.val());
            } else {
                return false;
            }
        }
        function applyCode($input) {
            check($input) ? success.call($input.get(0)) : failure.call($input.get(0));
        }
        if (typeof on === "string") $input.bind(on, function() {
            applyCode($(this));
        });
        if (testInitially) $input.each(function() {
            applyCode($(this));
        });
        return check($input);
    };
    $(document).ready(UTIL.loadEvents);
})(jQuery);