var ChainList = artifacts.require("./ChainList.sol");

// test suite
contract('ChainList', function(accounts){
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName = "article 1";
  var articleDescription = "Description for article 1";
  var articlePrice = 10;
  var sellerBalanceBeforeBuy,sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy,buyerBalanceAfterBuy;

  it("should be initialized with empty values", function() {
    return ChainList.deployed().then(function(instance) {
      return instance.getArticle();
    }).then(function(data) {
      assert.equal(data[0], 0x0, "seller must be empty");
      assert.equal(data[1], 0x0, "buyer must be empty");
      assert.equal(data[2], "", "article name must be empty");
      assert.equal(data[3], "", "article description must be empty");
      assert.equal(data[4].toNumber(), 0, "article price must be zero");
    })
  });

  it("should sell an article", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName, articleDescription, web3.utils.toWei(articlePrice.toString(), "ether"), { from: seller});
    }).then(function() {
      return chainListInstance.getArticle();
    }).then(function(data) {
      assert.equal(data[0], seller, "seller must be " + seller);
      assert.equal(data[1], 0x0, "seller must be " + buyer);
      assert.equal(data[2], articleName, "article name must be " + articleName);
      assert.equal(data[3], articleDescription, "article description must be " + articleDescription);
      //assert.equal(web3.utils.toBN(data[3]),1,"arti");
      assert.equal(web3.utils.toBN(data[4]), web3.utils.toWei(articlePrice.toString(), "ether"), "article price must be " + web3.utils.toWei(articlePrice.toString(), "ether"));
    });
  });

  it("should buy an article",function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
       
                              web3.eth.getBalance(seller).then(function(balance){
                                b = web3.utils.fromWei(balance, 'ether')
                                // return b.toString();
                              });

                              sellerBalanceBeforeBuy = b;
    
                              web3.eth.getBalance(buyer).then(function(balance){
                                b = web3.utils.fromWei(balance, 'ether')
                                // return b.toString();
                              });

                              buyerBalanceBeforeBuy = b;


      return chainListInstance.buyArticle({from : buyer,value:web3.utils.toWei(articlePrice.toString(),"ether")});
    }).then(function(receipt){
      assert.equal(receipt.logs.length,1,"one event should have been triggered");
      assert.equal(receipt.logs[0].event,"LogBuyArticle","event shoild be Log Buy article");
      assert.equal(receipt.logs[0].args._seller,seller,"event seller must be " + seller);
      assert.equal(receipt.logs[0].args._buyer,buyer,"event buyer must be " + buyer);
      assert.equal(receipt.logs[0].args._name,articleName,"event article name must be " + articleName);
      assert.equal(web3.utils.toBN(receipt.logs[0].args._price),web3.utils.toWei(articlePrice.toString(),"ether"),"event article price must be " + articlePrice);

      
                              web3.eth.getBalance(seller).then(function(balance){
                                b = web3.utils.fromWei(balance, 'ether')
                                // return b.toString();
                              });

                              sellerBalanceAfterBuy = b;

     
                              web3.eth.getBalance(buyer).then(function(balance){
                                b = web3.utils.fromWei(balance, 'ether')
                                // return b.toString();
                              });  
                              
                              buyerBalanceAfterBuy = b;
      
      // YE NAHI CHAL RAHA                              
      // sellerBalanceAfterBuy = web3.utils.fromWei(web3.eth.getBalance(seller).toString(),"ether").toNumber();
      // buyerBalanceAfterBuy = web3.utils.fromWei(web3.eth.getBalance(buyer).toString(),"ether").toNumber();
      //console.log('this should print something ===>>> : ' + sellerBalanceBeforeBuy);
      //console.log('this should print something ===>>> : ' + sellerBalanceAfterBuy);
      //console.log('this should print something ===>>> : ' + buyerBalanceBeforeBuy);
      //console.log('this should print something ===>>> : ' + buyerBalanceAfterBuy);
      //console.log('this should print something ===>>> : ' + articlePrice);
      //check the effect of buy on balances of buyer and seller, accounting for gas
      
      //assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice,"seller should have earned" + articlePrice + " ETH");
      //assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice,"buyer should have spend" + articlePrice + " ETH");

      return chainListInstance.getArticle();
    }).then(function(data){
      assert.equal(data[0], seller, "seller must be " + seller);
      assert.equal(data[1], buyer, "buyer must be " + buyer);
      assert.equal(data[2], articleName, "article name must be " + articleName);
      assert.equal(data[3], articleDescription, "article description must be " + articleDescription);
      //assert.equal(web3.utils.toBN(data[3]),1,"arti");
      assert.equal(web3.utils.toBN(data[4]), web3.utils.toWei(articlePrice.toString(), "ether"), "article price must be " + web3.utils.toWei(articlePrice.toString(), "ether"));
    });
  });
  
  it("should trigger an event when a new article is sold",function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName,articleDescription,web3.utils.toWei(articlePrice.toString(),"ether"),{from : seller});
    }).then(function(receipt){
      assert.equal(receipt.logs.length,1,"one event should have been triggered");
      assert.equal(receipt.logs[0].event,"LogSellArticle","event shoild be log sell article");
      assert.equal(receipt.logs[0].args._seller,seller,"event saeler must be " + seller);
      assert.equal(receipt.logs[0].args._name,articleName,"event article name must be " + articleName);
      assert.equal(web3.utils.toBN(receipt.logs[0].args._price),web3.utils.toWei(articlePrice.toString(),"ether"),"event article price must be " + articlePrice);
    });
  });


 

});
