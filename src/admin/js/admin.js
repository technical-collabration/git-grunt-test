(function($) {
    "use strict";
    var PAFB_SURVEY = {
        common: {
            init: function() {
                var $wrap_elem = $(".wrap-survey-section");
                var $noitem_elem = $(".survey-noitem");
                var changes_made = false;
                if ($wrap_elem.length <= 0) {
                    return;
                }
                $("#publishing-action #publish,#minor-publishing-actions #save-post").on("click", function() {
                    changes_made = false;
                });
                // prompt changes made
                $(window).bind("beforeunload", function() {
                    if (changes_made) {
                        return postL10n.saveAlert;
                    }
                });
                // Multiselect - deselects all and reset to default
                $("select[multiple]").change(function() {
                    var me = $(this);
                    $.each(me.val(), function(i, d) {
                        if (d != "" && me.val().length > 1) {
                            me.find("option")[0].selected = false;
                        }
                    });
                });
                // Add survey items
                $("ul.survey-category li a").on("click", function() {
                    var $question_type = $(this).data("type");
                    PAFB_SURVEY.common.add_survey_question_field($question_type, []);
                    changes_made = true;
                });
                // Load saved questions items
                if (typeof pafb_survey_items !== "undefined") {
                    $.each(pafb_survey_items.reverse(), function(i, d) {
                        PAFB_SURVEY.common.add_survey_question_field(d.type, d);
                    });
                    if (pafb_survey_items.length <= 0) {
                        $noitem_elem.show();
                    } else {
                        $noitem_elem.hide();
                    }
                }
                // Sortable questions items
                $wrap_elem.sortable({
                    connectWith: $wrap_elem,
                    item: ".postbox[class!=item-confirmation]",
                    cursor: "move",
                    scrollSpeed: 1e3,
                    placeholder: "ui-state-highlight",
                    handle: "h3"
                });
                $wrap_elem.disableSelection();
                // Preview Question
                $wrap_elem.on("keyup", "input[id=survey-question]", function() {
                    var me = $(this);
                    var preview = me.closest(".inside").parent(".postbox").find(".survey-item-preview");
                    if (me.val().length <= 90) {
                        preview.text(me.val());
                    } else if (me.val().length >= 95) {
                        preview.text(me.val().substring(0, 90) + "...");
                    }
                    changes_made = true;
                });
                // Toggle question items handlediv
                $.each($(".wrap-survey-section .postbox"), function() {
                    $(this).toggleClass("closed");
                });
                // Remove survey questions 
                $wrap_elem.on("click", ".survey-item-remove", function() {
                    var postbox = $(this).closest(".inside").parent(".wrap-survey-section .postbox");
                    postbox.remove();
                    var items = $(".wrap-survey-section .postbox").length;
                    if (items <= 0) {
                        $noitem_elem.fadeIn();
                    }
                    changes_made = true;
                });
                // Force confirmation postbox at the bottom 
                $(document.body).on("sortupdate", ".postbox", function(event, ui) {
                    if (ui.item.hasClass("item-confirmation")) {
                        ui.item.appendTo($wrap_elem);
                        changes_made = true;
                    }
                });
                // add choice input field
                $wrap_elem.on("click", "a.choice-add-input", function() {
                    PAFB_SURVEY.common.add_choice_input_field($(this), $wrap_elem, "");
                    changes_made = true;
                });
                // remove choice input field
                $wrap_elem.on("click", "a.choice-remove-input", function() {
                    PAFB_SURVEY.common.remove_choice_input_field($(this));
                    changes_made = true;
                });
                // sortable choices items
                $("ul#choice-items").sortable({
                    cursor: "move",
                    scrollSpeed: 1e3,
                    placeholder: "ui-state-highlight-choice"
                });
                // add sample questions
                $(".add-sample-survey-quetions").on("click", function() {
                    PAFB_SURVEY.common.add_sample_questions();
                    changes_made = true;
                });
            },
            add_survey_question_field: function(type, data) {
                // get current item size
                var items_size = PAFB_SURVEY.common.get_items_size();
                var tpl = [];
                switch (type) {
                  case "positive-negative":
                    tpl.push([ '<div class="postbox  item-' + type + '">', '<div class="handlediv"  title=""><br></div>', "<h3>", '<span class="survey-item-preview"  id="survey-item-preview">' + (typeof data.question !== "undefined" ? data.question : "") + "</span>", "</h3>", '<div class="inside">', "<hr/>", '<div class="survey-item" >', '<div style="padding:10px;">', "<div>", '<label for="survey-question">' + pafb_labels.question + "</label>", '<input type="text" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][question]" value="' + (typeof data.question !== "undefined" ? data.question : "") + '" id="survey-question" style="width:100%;"  />', "</div>", "</div>", '<div style="padding:10px;">', "<div>", '<label for="">' + pafb_labels.positive + ":", "<br/>", '<input type="text" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][positive]" value="' + (typeof data.positive !== "undefined" ? data.positive : "") + '" style="width:100%;" />', "</label>", "</div>", "</div>", '<div style="padding:10px;">', "<div>", '<label for="">' + pafb_labels.negative + ":</label>", "<br/>", '<input type="text" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][negative]"  value="' + (typeof data.negative !== "undefined" ? data.negative : "") + '" style="width:100%;" />', "</div>", "</div>", '<div style="padding:10px;">', "<div>", "<label>", '<input type="checkbox" value="1" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][required]"  ' + (typeof data.required !== "undefined" && data.required == true ? 'checked="checked"' : "") + " />", "" + pafb_labels.required + "</label>", "</div>", "</div>", '<div style="padding:10px;">', '<a href="javascript:;" class="survey-item-remove button">', '<span class="dashicons dashicons-trash" style="margin-top: 3px;"></span>', "</a>", "</div>", "</div>", '<input type="hidden" value="' + type + '" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][type]"   />', "</div>", "</div>" ].join(""));
                    break;

                  case "choice":
                    var choices = [];
                    if (typeof data.choices !== "undefined" && data.choices.length > 0) {
                        $.each(data.choices, function(i, d) {
                            if (d != "") {
                                choices.push([ "<li>", '<input type="text" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][choices][]" value="' + d + '"  />', '<a href="javascript:;"  class="button choice-add-input"><span class="dashicons dashicons-plus"></span></a>', '<a href="javascript:;"  class="button choice-remove-input"><span class="dashicons dashicons-minus"></span></a>', "</li>" ].join(""));
                            }
                        });
                    } else {
                        choices.push([ "<li>", '<input type="text" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][choices][]"  />', '<a href="javascript:;"  class="button choice-add-input"><span class="dashicons dashicons-plus"></span></a>', '<a href="javascript:;"  class="button choice-remove-input"><span class="dashicons dashicons-minus"></span></a>', "</li>" ].join(""));
                    }
                    tpl.push([ '<div class="postbox  item-' + type + '">', '<div class="handlediv"  title=""><br></div>', "<h3>", '<span class="survey-item-preview"  id="survey-item-preview">' + (typeof data.question !== "undefined" ? data.question : "") + "</span>", "</h3>", '<div class="inside">', "<hr/>", '<div class="survey-item" >', '<div style="padding:10px;">', "<div>", '<label for="survey-question">' + pafb_labels.question + "</label>", '<input type="text" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][question]" value="' + (typeof data.question !== "undefined" ? data.question : "") + '" id="survey-question" style="width:100%;"  />', "</div>", "</div>", '<div style="padding:10px;">', "<div>", "<label>" + pafb_labels.choices + "</label>", '<ul class="choice-items" id="choice-items" data-id="' + items_size + '">', choices.join(""), "</ul>", "</div>", "</div>", '<div style="padding:10px;">', "<div>", "<label>", '<input type="checkbox" value="1" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][multiple_choice]"  ' + (typeof data.multiple_choice !== "undefined" && data.multiple_choice == true ? 'checked="checked"' : "") + " />", "" + pafb_labels.multiple_choice + "</label>", "</div>", "</div>", '<div style="padding:10px;">', "<div>", "<label>", '<input type="checkbox" value="1" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][required]"  ' + (typeof data.required !== "undefined" && data.required == true ? 'checked="checked"' : "") + " />", "" + pafb_labels.required + "</label>", "</div>", "</div>", '<div style="padding:10px;">', '<a href="javascript:;" class="survey-item-remove button">', '<span class="dashicons dashicons-trash" style="margin-top: 3px;"></span>', "</a>", "</div>", "</div>", '<input type="hidden" value="' + type + '" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][type]"   />', "</div>", "</div>" ].join(""));
                    break;

                  case "rating":
                    tpl.push([ '<div class="postbox  item-' + type + '">', '<div class="handlediv"  title=""><br></div>', "<h3>", '<span class="survey-item-preview"  id="survey-item-preview">' + (typeof data.question !== "undefined" ? data.question : "") + "</span>", "</h3>", '<div class="inside">', "<hr/>", '<div class="survey-item" >', '<div style="padding:10px;">', "<div>", '<label for="survey-question">' + pafb_labels.question + "</label>", '<input type="text" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][question]" value="' + (typeof data.question !== "undefined" ? data.question : "") + '" id="survey-question" style="width:100%;"  />', "</div>", "</div>", '<div style="padding:10px;">', "<div>", '<label for="">' + pafb_labels.positive + ":", "<br/>", '<input type="text" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][positive]" value="' + (typeof data.positive !== "undefined" ? data.positive : "") + '" style="width:100%;" />', "</label>", "</div>", "</div>", '<div style="padding:10px;">', "<div>", '<label for="">' + pafb_labels.negative + ":</label>", "<br/>", '<input type="text" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][negative]"  value="' + (typeof data.negative !== "undefined" ? data.negative : "") + '" style="width:100%;" />', "</div>", "</div>", '<div style="padding:10px;">', "<div>", '<label for="">' + pafb_labels.rating_range + ":</label>", "<br/>", '<select name="pafb_survey_questions[pafb_questions_item][' + items_size + '][rating_range]">', '<option value="5"  ' + (typeof data.rating_range !== "undefined" && data.rating_range == 5 ? 'selected="selected"' : "") + ">1 to 5</option>", '<option value="10" ' + (typeof data.rating_range !== "undefined" && data.rating_range == 10 ? 'selected="selected"' : "") + ">1 to 10</option>", "</select>", "</div>", "</div>", '<div style="padding:10px;">', "<div>", "<label>", '<input type="checkbox" value="1" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][required]"  ' + (typeof data.required !== "undefined" && data.required == true ? 'checked="checked"' : "") + " />", "" + pafb_labels.required + "</label>", "</div>", "</div>", '<div style="padding:10px;">', '<a href="javascript:;" class="survey-item-remove button">', '<span class="dashicons dashicons-trash" style="margin-top: 3px;"></span>', "</a>", "</div>", "</div>", '<input type="hidden" value="' + type + '" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][type]"   />', "</div>", "</div>" ].join(""));
                    break;

                  case "email":
                    tpl.push([ '<div class="postbox  item-' + type + '">', '<div class="handlediv"  title=""><br></div>', "<h3>", '<span class="survey-item-preview"  id="survey-item-preview">' + (typeof data.question !== "undefined" ? data.question : "") + "</span>", "</h3>", '<div class="inside">', "<hr/>", '<div class="survey-item" >', '<div style="padding:10px;">', "<div>", '<label for="survey-question">' + pafb_labels.question + "</label>", '<input type="text" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][question]" value="' + (typeof data.question !== "undefined" ? data.question : "") + '" id="survey-question" style="width:100%;"  />', "</div>", "</div>", '<div style="padding:10px;">', "<div>", '<label for="survey-question">' + pafb_labels.placeholder_text + "</label>", '<input type="text" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][placeholder_text]" value="' + (typeof data.placeholder_text !== "undefined" ? data.placeholder_text : "") + '" style="width:100%;"  />', "</div>", "</div>", '<div style="padding:10px;">', "<div>", "<label>", '<input type="checkbox" value="1" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][required]"  ' + (typeof data.required !== "undefined" && data.required == true ? 'checked="checked"' : "") + " />", "" + pafb_labels.required + "</label>", "</div>", "</div>", '<div style="padding:10px;">', '<a href="javascript:;" class="survey-item-remove button">', '<span class="dashicons dashicons-trash" style="margin-top: 3px;"></span>', "</a>", "</div>", "</div>", '<input type="hidden" value="' + type + '" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][type]"   />', "</div>", "</div>" ].join(""));
                    break;

                  case "singlefield":
                    tpl.push([ '<div class="postbox  item-' + type + '">', '<div class="handlediv"  title=""><br></div>', "<h3>", '<span class="survey-item-preview"  id="survey-item-preview">' + (typeof data.question !== "undefined" ? data.question : "") + "</span>", "</h3>", '<div class="inside">', "<hr/>", '<div class="survey-item" >', '<div style="padding:10px;">', "<div>", '<label for="survey-question">' + pafb_labels.question + "</label>", '<input type="text" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][question]" value="' + (typeof data.question !== "undefined" ? data.question : "") + '" id="survey-question" style="width:100%;"  />', "</div>", "</div>", '<div style="padding:10px;">', "<div>", '<label for="survey-question">' + pafb_labels.placeholder_text + "</label>", '<input type="text" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][placeholder_text]" value="' + (typeof data.placeholder_text !== "undefined" ? data.placeholder_text : "") + '" style="width:100%;"  />', "</div>", "</div>", '<div style="padding:10px;">', "<div>", "<label>", '<input type="checkbox" value="1" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][required]"  ' + (typeof data.required !== "undefined" && data.required == true ? 'checked="checked"' : "") + " />", "" + pafb_labels.required + "</label>", "</div>", "</div>", '<div style="padding:10px;">', '<a href="javascript:;" class="survey-item-remove button">', '<span class="dashicons dashicons-trash" style="margin-top: 3px;"></span>', "</a>", "</div>", "</div>", '<input type="hidden" value="' + type + '" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][type]"   />', "</div>", "</div>" ].join(""));
                    break;

                  case "multiplefield":
                    tpl.push([ '<div class="postbox  item-' + type + '">', '<div class="handlediv"  title=""><br></div>', "<h3>", '<span class="survey-item-preview"  id="survey-item-preview">' + (typeof data.question !== "undefined" ? data.question : "") + "</span>", "</h3>", '<div class="inside">', "<hr/>", '<div class="survey-item" >', '<div style="padding:10px;">', "<div>", '<label for="survey-question">' + pafb_labels.question + "</label>", '<input type="text" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][question]" value="' + (typeof data.question !== "undefined" ? data.question : "") + '" id="survey-question" style="width:100%;"  />', "</div>", "</div>", '<div style="padding:10px;">', "<div>", '<label for="survey-question">' + pafb_labels.placeholder_text + "</label>", '<textarea name="pafb_survey_questions[pafb_questions_item][' + items_size + '][placeholder_text]" style="width:100%;">' + (typeof data.placeholder_text !== "undefined" ? data.placeholder_text : "") + "</textarea>", "</div>", "</div>", '<div style="padding:10px;">', "<div>", "<label>", '<input type="checkbox" value="1" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][required]"  ' + (typeof data.required !== "undefined" && data.required == true ? 'checked="checked"' : "") + " />", "" + pafb_labels.required + "</label>", "</div>", "</div>", '<div style="padding:10px;">', '<a href="javascript:;" class="survey-item-remove button">', '<span class="dashicons dashicons-trash" style="margin-top: 3px;"></span>', "</a>", "</div>", "</div>", '<input type="hidden" value="' + type + '" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][type]"   />', "</div>", "</div>" ].join(""));
                    break;

                  case "confirmation":
                    if ($(".item-" + type).size() <= 0) {
                        tpl.push([ '<div class="postbox item-' + type + '" id="item-' + type + '">', '<div class="handlediv"  title=""><br></div>', "<h3>", '<span class="survey-item-preview"  id="survey-item-preview">' + (typeof data.confirmation !== "undefined" ? data.confirmation : "") + "</span>", "</h3>", '<div class="inside">', "<hr/>", '<div class="survey-item" >', '<div style="padding:10px;">', "<div>", '<label for="survey-question">' + pafb_labels.confirmation + "</label>", '<textarea name="pafb_survey_questions[pafb_questions_item][' + items_size + '][confirmation]" id="survey-question" style="width:100%;">', "Thank you for your feedback!", "</textarea>", "</div>", "</div>", '<div style="padding:10px;">', '<a href="javascript:;" class="survey-item-remove button">', '<span class="dashicons dashicons-trash" style="margin-top: 3px;"></span>', "</a>", "</div>", "</div>", '<input type="hidden" value="' + type + '" name="pafb_survey_questions[pafb_questions_item][' + items_size + '][type]"   />', "</div>", "</div>" ].join(""));
                    }
                    break;
                }
                PAFB_SURVEY.common.append_question_field(tpl);
            },
            add_choice_input_field: function(elem, wrap, val) {
                var id = wrap.find("ul.choice-items").data("id");
                var arr_input = [];
                arr_input = [ "<li>", '<input type="text" name="pafb_survey_questions[pafb_questions_item][' + id + '][choices][]" value=""  />', '<a href="javascript:;"  class="button choice-add-input"><span class="dashicons dashicons-plus"></span></a>', '<a href="javascript:;"  class="button choice-remove-input"><span class="dashicons dashicons-minus"></span></a>', "</li>" ];
                if (arr_input.length > 0) {
                    elem.parent("li").after(arr_input.join(""));
                }
                $("ul#choice-items").sortable({
                    cursor: "move",
                    scrollSpeed: 1e3,
                    placeholder: "ui-state-highlight-choice"
                });
            },
            remove_choice_input_field: function(me) {
                var wrap = me.parent("li");
                wrap.remove();
            },
            append_question_field: function(tpl) {
                // append item template to wrapper
                $(".wrap-survey-section").prepend(tpl.join(""));
                // get items size
                var items_size = PAFB_SURVEY.common.get_items_size();
                // toggle label 'no survey questions found'
                if (items_size > 0) {
                    $(".wrap-survey-section .survey-noitem").hide();
                } else {
                    $(".wrap-survey-section .survey-noitem").show();
                }
            },
            get_items_size: function() {
                var survey_items_size = $(".survey-item").size();
                return survey_items_size;
            },
            add_sample_questions: function() {
                var questions = [];
                // positive/negative
                questions.push({
                    type: "positive-negative",
                    question: "Was this article helpful?",
                    positive: "Helpful",
                    negative: "Not Helpful",
                    required: true
                });
                // choices
                questions.push({
                    type: "choice",
                    question: "What appeals to you most about this post?",
                    choices: [ "Grammar", "Choice of Topic", "Delivery", "Story", "Everything" ],
                    required: true
                });
                // Ratings
                questions.push({
                    type: "rating",
                    question: "On a scale of 1-10, please rate the helpfulness of this article.",
                    rating_range: 10,
                    positive: "Very Helpful",
                    negative: "Not Helfpul",
                    required: true
                });
                // Email
                questions.push({
                    type: "email",
                    question: "If you need us to contact you please provide your email below.",
                    placeholder_text: "Email",
                    required: true
                });
                // Singlefield
                questions.push({
                    type: "singlefield",
                    question: "If you need us to contact you please provide your name below.",
                    placeholder_text: "Name",
                    required: true
                });
                // Multiplefield
                questions.push({
                    type: "multiplefield",
                    question: "Please tell us how we can improve this artlce?",
                    placeholder_text: "We know there is value in constructive criticism",
                    required: true
                });
                // Confirmation
                questions.push({
                    type: "confirmation",
                    confirmation: "Thank you for your feedback!"
                });
                $.each(questions.reverse(), function(i, d) {
                    PAFB_SURVEY.common.add_survey_question_field(d.type, d);
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
    $(document).ready(UTIL.loadEvents);
})(jQuery);