function make_slides(f) {
  var slides = {};

  slides.bot = slide({
    name : "bot",
    start: function() {
      $('.err1').hide();
      $('.err2').hide();
      $('.disq').hide();
      exp.speaker = _.shuffle(["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles"])[0];
      exp.listener = _.shuffle(["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Margaret"])[0];
      exp.lives = 0;
      var story = exp.speaker + ' says to ' + exp.listener + ': "It\'s a beautiful day, isn\'t it?"'
      var question = 'Who does ' + exp.speaker + ' talk to?';
      document.getElementById("s").innerHTML = story;
      document.getElementById("q").innerHTML = question;
    },
    button : function() {
      exp.text_input = document.getElementById("text_box").value;
      var lower = exp.listener.toLowerCase();
      var upper = exp.listener.toUpperCase();

      if ((exp.lives < 3) && ((exp.text_input == exp.listener)|(exp.text_input == lower) | (exp.text_input== upper))){
        exp.data_trials.push({
          "slide_number_in_experiment" : exp.phase,
          "utterance": "bot_check",
          "object": exp.listener,
          "rt" : 0,
          "response" : exp.text_input
        });
        exp.go();
      }
      else {
        exp.data_trials.push({
          "slide_number_in_experiment" : exp.phase,
          "utterance": "bot_check",
          "object": exp.listener,
          "rt" : 0,
          "response" : exp.text_input
        });
        if (exp.lives == 0){
          $('.err1').show();
        }if (exp.lives == 1){
          $('.err1').hide();
          $('.err2').show();
        }if (exp.lives == 2){
          $('.err2').hide();
          $('.disq').show();
          $('.button').hide();
        }
        exp.lives++;
      } 
    },
  });

  slides.i0 = slide({
     name : "i0",
     start: function() {
      exp.startT = Date.now();
     }
  });

  slides.instructions = slide({
    name : "instructions",
    button : function() {
      exp.go(); 
    }
  });

  slides.objecttrial = slide({
    name : "objecttrial",
    present : exp.items,
    start : function() {
	     $(".err").hide();
    },
    present_handle : function(stim) {
      console.log("new trial started");
    	this.trial_start = Date.now();
      $(".err").hide();
      this.init_sliders();
      exp.sliderPost = null;

	    this.stim = stim;
	    console.log(this.stim);
      var contextsentence = "Bu resim bu objeyi yansitiyor mu?";
      var object = "<big><b>"+this.stim.item_tr+ "</b></big>";
      var objimagehtml = '<img src="images/'+stim.label+'.png" style="height:330px;">';

      $("#contextsentence").html(contextsentence);
      $("#object").html(object);
      $("#objectimage").html(objimagehtml);
      
	},

    button : function() {
      if (exp.sliderPost == null) {
        $(".err").show();
      } else if (exp.sliderPost != null) {   
        $(".err").hide();
        this.log_responses();
        _stream.apply(this); //use exp.go() if and only if there is no "present" data.        
      }
    },

    init_sliders : function() {
      utils.make_slider("#single_slider", function(event, ui) {
        exp.sliderPost = ui.value;
      });
    },

    log_responses : function() {
        exp.data_trials.push({
          "slide_number_in_experiment" : exp.phase,
          "label": this.stim.label,
          "item": this.stim.item,
          "color": this.stim.color,
          "size" : this.stim.size,
          "rt" : Date.now() - _s.trial_start,
          "response" : [exp.sliderPost]
        });
    }
  });

  slides.subj_info =  slide({
    name : "subj_info",
    submit : function(e){
      //if (e.preventDefault) e.preventDefault(); // I don't know what this means.
      exp.subj_data = {
        language : $("#language").val(),
        enjoyment : $("#enjoyment").val(),
        asses : $('input[name="assess"]:checked').val(),
        age : $("#age").val(),
        gender : $("#gender").val(),
        education : $("#education").val(),
        comments : $("#comments").val(),
      };
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.thanks = slide({
    name : "thanks",
    start : function() {
      exp.data= {
          "trials" : exp.data_trials,
          "catch_trials" : exp.catch_trials,
          "system" : exp.system,
          "condition" : exp.condition,
          "subject_information" : exp.subj_data,
          "time_in_minutes" : (Date.now() - exp.startT)/60000
      };
      setTimeout(function() {turk.submit(exp.data);}, 1000);
    }
  });

  return slides;
}

/// init ///
function init() {
  exp.items = _.shuffle([
    {
      "label": "car_big_blue",
      "item": "car",
      "item_tr": "oyuncak araba",
      "color": "blue",
      "size" : "big",
    },
    {
      "label": "car_big_green",
      "item": "car",
      "item_tr": "oyuncak araba",
      "color": "green",
      "size" : "big",
    },
    {
      "label": "flower_big_pink",
      "item": "flower",
      "item_tr": "cicek",
      "color": "pink",
      "size" : "big",
    },
    {
      "label": "flower_big_yellow",
      "item": "flower",
      "item_tr": "cicek",
      "color": "yellow",
      "size" : "big",
    },
    {
      "label": "glasses_big_blue",
      "item": "glasses",
      "item_tr": "gozluk",
      "color": "blue",
      "size" : "big",
    },
    {
      "label": "glasses_big_red",
      "item": "glasses",
      "item_tr": "gozluk",
      "color": "red",
      "size" : "big",
    },
]);

  function makeTargetStim(i) {
    console.log(items_target.length);
    //get item
    var item = items_target[i];
    var item_id = item.item[0];
    var object_label = item.label;
      
      return {
	  "item": item_id,
    "label": object_label
    }
  }
  
  exp.trials = [];
  exp.catch_trials = [];
  exp.condition = {}; //can randomize between subject conditions here
  exp.system = {
      Browser : BrowserDetect.browser,
      OS : BrowserDetect.OS,
      screenH: screen.height,
      screenUH: exp.height,
      screenW: screen.width,
      screenUW: exp.width
    };
  //blocks of the experiment:
  exp.structure=["bot","i0","objecttrial", 'subj_info', 'thanks'];
  //exp.structure=["objecttrial", 'subj_info', 'thanks'];
  // 
  
  exp.data_trials = [];
  //make corresponding slides:
  exp.slides = make_slides(exp);

  exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
                    //relies on structure and slides being defined
  $(".nQs").html(exp.nQs);

  $('.slide').hide(); //hide everything

  //make sure turkers have accepted HIT (or you're not in mturk)
  $("#start_button").click(function() {
    if (turk.previewMode) {
      $("#mustaccept").show();
    } else {
      $("#start_button").click(function() {$("#mustaccept").show();});
      exp.go();
    }
  });

  exp.go(); //show first slide
}
