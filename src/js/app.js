App = {
  web3Provider: null,
  contracts: {},
  account:0x0,
  loading: false,


  init: function() {

    return App.initWeb3();
  },

  initWeb3: function() {
    /*
    * Replace me...
    */
    if(window.ethereum){
      window.web3 = new Web3(ethereum);
      $('#need-metamask').hide();
    }else{
      console.log('Install Metamask');
      return ;
    }


    if(typeof web3 !== 'undefined'){
      //
      App.web3Provider = web3.currentProvider;
    }else{
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
    }


    try{
      ethereum.enable();
      $('#need-enable').hide();
    }catch(error){
      console.log('Error : Enable Account Access And Reload');
      return;
    }



    web3 = new Web3(App.web3Provider);


    App.displayAccountInfo();

    return App.initContract();
  },

  displayAccountInfo : function() {
    // acc = web3.eth.getAccounts();
    // web3.eth.defaultAccount = acc[0];

    web3.eth.getCoinbase(function(err,account){
      if(err === null){
        App.account = account;
        $('#account').text(account);
        web3.eth.getBalance(account,function(err,balance){
          if(err === null){
            $('#accountBalance').text(web3.fromWei(balance,"ether") + " ETH");
          }
        })
      }
    });

  },

  initContract: function() {
    /*
    * Replace me...
    */
    $.getJSON('ChainList.json',function(chainListArtifact){
      // get the contract artifact file and use it to instantiate a truffle contract abstraction

      App.contracts.ChainList = TruffleContract(chainListArtifact);
      // set the provider for our contracts

      App.contracts.ChainList.setProvider(App.web3Provider);
      // retrieve the article from the contract

      App.listenToEvents();
      //listen to event

      return App.reloadArticles();
    });

  },

  reloadArticles : function(){
    // avoid re-entering
    if (App.loading) {
      return;
    }

    App.loading = true;


    //refresh the account information because the balance might have changed
    App.displayAccountInfo();

    var chainListInstance;
    var chainListInstance2;



    App.contracts.ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return instance.getArticlesForSale();
    }).then(function(articleIds){
      console.log('inside articleIds');
      // retrieve the article placeholder and clear it
      //$('#articlesRow').empty();

      for (var i = 0; i < articleIds.length; i++) {
        var articleId = articleIds[i];
        chainListInstance.articles(articleId.toNumber()).then(function(article){
          // 0 is id, 1 is seller, 3 is name, 4 is description, 5 is price, 6 is duedate, 7 is payback, 8 is donated_money
          App.displayArticle(
            article[0],
            article[1],
            article[3],
            article[4],
            article[5],
            article[6],
            article[8]
          );

        });
      }

      App.loading = false;

    }).catch(function(err){
      console.error(err.message);
      App.loading = false;
    });

    App.contracts.ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return instance.soldArticles();
    }).then(function(soldArticles){
      console.log('inside soldArticles');
      // retrieve the article placeholder and clear it
      //$('#articlesRow').empty();

      for (var i = 0; i < soldArticles.length; i++) {
        var _articleId = soldArticles[i];
        chainListInstance.articles(_articleId.toNumber()).then(function(article){
          // 0 is id, 1 is seller, 3 is name, 4 is description, 5 is price, 6 is duedate, 7 is payed_back, 8 is donated_money
          App.displaysoldArticle(
            article[0],
            article[1],
            article[2],
            article[3],
            article[4],
            article[5],
            article[6],
            article[7],
            article[8]
          );

        });
      }

      App.loading = false;

    }).catch(function(err){
      console.error(err.message);
      App.loading = false;
    });

  },


  displayArticle: function(id, seller, name, description, price, duedate, donated_money) {
    var articlesRow = $('#articlesRow');

    var etherprice = web3.fromWei(price, 'ether');

    var articleTemplate = $('#articleTemplate');
    articleTemplate.find('.panel-title').text(name);
    articleTemplate.find('.article-description').text(description);
    articleTemplate.find('.article-price').text(etherprice + " ETH");
    articleTemplate.find('.btn-buy').attr('data-id', id);
    articleTemplate.find('.btn-buy').attr('data-value', etherprice);
    articleTemplate.find('.btn-donate').attr('data-id', id);
    articleTemplate.find('.btn-donate').attr('data-value', etherprice);
    articleTemplate.find('.btn-payback').attr('data-id', id);
    articleTemplate.find('.btn-payback').attr('data-value', etherprice);
    articleTemplate.find('.article-duedate').text(duedate);
    articleTemplate.find('.article-status').text("-");

    if (donated_money === true) {
      articleTemplate.find('.article-requesttype').text("Donation");
    } else {
      articleTemplate.find('.article-requesttype').text("Loan");
    }


    // seller
    if (seller == App.account) {
      articleTemplate.find('.article-seller').text("You");
      articleTemplate.find('.btn-buy').hide();
      articleTemplate.find('.btn-donate').hide();
      articleTemplate.find('.btn-payback').hide();
    } else {
      articleTemplate.find('.article-seller').text(seller);
      if (donated_money === true) {
        articleTemplate.find('.btn-buy').hide();
        articleTemplate.find('.btn-donate').show();
      } else {
        articleTemplate.find('.btn-buy').show();
        articleTemplate.find('.btn-donate').hide();
      }
      articleTemplate.find('.btn-payback').hide();
    }

    // add this new article to html
    articlesRow.append(articleTemplate.html());
  },

  // displaying loans gave by you
  displaysoldArticle: function(id, seller, buyer, name, description, price, duedate, payed_back, donated_money) {

    // loans that you gave
    if (buyer == App.account) {
      console.log('inside buyer : ' + duedate);
      var articlesRow = $('#soldarticlesRow');

      var etherprice = web3.fromWei(price, 'ether');

      var articleTemplate = $('#articleTemplate');
      articleTemplate.find('.panel-title').text(name);
      articleTemplate.find('.article-description').text(description);
      articleTemplate.find('.article-price').text(etherprice + " ETH");
      //articleTemplate.find('.btn-buy').attr('data-id', id);
      //articleTemplate.find('.btn-buy').attr('data-value', etherprice);
      //articleTemplate.find('.btn-donate').attr('data-id', id);
      //articleTemplate.find('.btn-donate').attr('data-value', etherprice);

      if (donated_money === true) {
        articleTemplate.find('.article-requesttype').text("Donation");
        articleTemplate.find('.article-duedate').text("-");
        articleTemplate.find('.article-status').text("Donated !");
      } else {
        articleTemplate.find('.article-requesttype').text("Loan");
        articleTemplate.find('.article-duedate').text(duedate);
        if (payed_back === true) {
          articleTemplate.find('.article-status').text("Received !");
        } else {
          articleTemplate.find('.article-status').text("Pending !");
        }
      }

      articleTemplate.find('.article-seller').text(seller);
      articleTemplate.find('.article-buyer').text(buyer);
      articleTemplate.find('.btn-buy').hide();
      articleTemplate.find('.btn-donate').hide();
      articleTemplate.find('.btn-payback').hide();

      // add this new article to html
      articlesRow.append(articleTemplate.html());

      if (donated_money !== true) {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = yyyy + '-' + dd + '-' + mm;
        console.log(today);
        console.log(duedate);

        var a = today.split('-');
        var b = duedate.split('-');

        var tmp = a[1]; a[1] = a[2]; a[2] = tmp;
        //tmp = b[1]; b[1] = b[2]; b[2] = tmp;

        console.log(a);
        console.log(b);

        for (var i = 0; i < a.length; i++) {

          a[i] = parseInt(a[i]);
          b[i] = parseInt(b[i]);

          if (a[i] > b[i]) {
            console.log('generate');
            alert('Due date expired for some loans');
          }

          if (a[i] < b[i]) {
            break;
          }
        }
      }
    }

    // loans that you need to pay back
    if (seller == App.account) {
      var articlesRow = $('#requestedarticlesRow');

      var etherprice = web3.fromWei(price, 'ether');

      var articleTemplate = $('#articleTemplate');
      articleTemplate.find('.panel-title').text(name);
      articleTemplate.find('.article-description').text(description);
      articleTemplate.find('.article-price').text(etherprice + " ETH");
      articleTemplate.find('.btn-payback').attr('data-id', id);
      articleTemplate.find('.btn-payback').attr('data-value', etherprice);
      //articleTemplate.find('.btn-buy').attr('data-id', id);
      //articleTemplate.find('.btn-buy').attr('data-value', etherprice);
      //articleTemplate.find('.btn-donate').attr('data-id', id);
      //articleTemplate.find('.btn-donate').attr('data-value', etherprice);

      articleTemplate.find('.article-seller').text(seller);
      articleTemplate.find('.article-buyer').text(buyer);
      articleTemplate.find('.btn-buy').hide();
      articleTemplate.find('.btn-donate').hide();

      if (donated_money === true) {
        articleTemplate.find('.article-status').text("Donated !");
        articleTemplate.find('.btn-payback').hide();
        articleTemplate.find('.article-duedate').text("-");
        articleTemplate.find('.article-requesttype').text("Donation");
      } else {
        articleTemplate.find('.article-duedate').text(duedate);
        articleTemplate.find('.article-requesttype').text("Loan");
        if (payed_back === true) {
          articleTemplate.find('.article-status').text("Paid Sucessfully !");
          articleTemplate.find('.btn-payback').hide();
        } else {
          articleTemplate.find('.article-status').text("Pending !");
          articleTemplate.find('.btn-payback').show();
        }
      }

      //console.log(id.toNumber());
      //console.log(buyer);
      //console.log(seller);

      // add this new article to html
      articlesRow.append(articleTemplate.html());
    }

  },

  sellArticle : function() {
    // retrieve the details of the article
    var _article_name = $('#article_name').val();
    var _description = $('#article_description').val();
    var _price = web3.toWei(parseFloat($('#article_price').val() || 0),"ether");
    var _duedate = $('#article_duedate').val();
    var _payed_back = false;
    var _donated_money = false;

    var selected_option = $("#article_request_type :selected").val();

    if (selected_option === 'donate') {
      _donated_money = true;
    }

    console.log(selected_option);


    if((_article_name.trim() == "") || (_price == 0)) {
      return false;
    }

    App.contracts.ChainList.deployed().then(function(instance){
      return instance.sellArticle(_article_name,_description,_price,_duedate,_payed_back,_donated_money,{
        from : App.account,
        gas : 500000
      });
    }).then(function(result){
      //App.reloadArticles();
    }).catch(function(err){
      console.error(err);
    });
  },

  // listening events triggered by CONTRACT
  listenToEvents : function(){
    App.contracts.ChainList.deployed().then(function(instance){
      instance.LogSellArticle({},{}).watch(function(error,event){
        if(!error){
          $("#events").append('<li class = "list-group-item">' + event.args._name + ' loan is requested </li>');
        }else{
          console.error(error);
        }
        App.reloadArticles()
      });

      instance.LogBuyArticle({},{}).watch(function(error,event){
        if(!error){
          $("#events").append('<li class = "list-group-item">' + event.args._buyer + ' gave loan for ' + event.args._name + '</li>');
        }else{
          console.error(error);
        }
        App.reloadArticles()
      });

      instance.LogdonateArticle({},{}).watch(function(error,event){
        if(!error){
          $("#events").append('<li class = "list-group-item">' + event.args._buyer + ' donated ' + event.args._name + '</li>');
        }else{
          console.error(error);
        }
        App.reloadArticles()
      });

    });
  },

  buyArticle : function(){
    event.preventDefault();
    //retrive the article price
    //event.target is the button
    var price = parseFloat($(event.target).data('value'));
    var _articleId = $(event.target).data('id');

    console.log(event.target);
    console.log(_articleId);
    console.log(price);

    // after getting value from button,
    // who ever is connected will be able to buy an article
    App.contracts.ChainList.deployed().then(function(instance){
      return instance.buyArticle(_articleId, {
        from : App.account,
        value : web3.toWei(price,"ether"),
        gas : 500000
      });
    }).catch(function(error){
      console.error(error);
    });
  },

  paybackLoan : function(){
    event.preventDefault();
    //retrive the article price
    //event.target is the button
    var price = parseFloat($(event.target).data('value'));
    var _articleId = $(event.target).data('id');

    console.log(event.target);
    console.log(_articleId);
    console.log(price);

    // after getting value from button,
    // who ever is connected will be able to buy an article
    App.contracts.ChainList.deployed().then(function(instance){
      return instance.paybackLoan(_articleId, {
        from : App.account,
        value : web3.toWei(price,"ether"),
        gas : 500000
      });
    }).catch(function(error){
      console.error(error);
    });
  },

  donateArticle : function(){
    event.preventDefault();
    //retrive the article price
    //event.target is the button
    var price = parseFloat($(event.target).data('value'));
    var _articleId = $(event.target).data('id');

    console.log(event.target);
    console.log(_articleId);
    console.log(price);

    // after getting value from button,
    // who ever is connected will be able to buy an article
    App.contracts.ChainList.deployed().then(function(instance){
      return instance.donateArticle(_articleId, {
        from : App.account,
        value : web3.toWei(price,"ether"),
        gas : 500000
      });
    }).catch(function(error){
      console.error(error);
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();/*Gets Called When page Gets Loaded*/
  });
});
