pragma solidity >=0.5.0;

contract ChainList {

  struct Article {
    uint id;
    address payable seller;
    address payable buyer;
    string name;
    string description;
    uint256 price;
    string duedate;
    bool payed_back;
    bool donated_money;
  }

  // state variables
  /* address payable seller;
  address payable buyer;
  string name;
  string description;
  uint256 price; */

  /*
  NOTE: declaring state variable as public order solidity to generate getter for us
  later on this getter will help us to retrive article based on key/index
  */
  mapping (uint => Article) public articles;
  uint articleCounter;


  //events
  event LogSellArticle(
    uint indexed _id,
    address indexed _seller,
    string _name,
    uint256 _price
  );

  event LogBuyArticle(
    uint indexed _id,
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price
  );

  event LogdonateArticle(
    uint indexed _id,
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price
  );

  //Constructor
  //function ChainList() public{
    //  sellArticle("Default Article","This IS Default Article",1000000000000000000);
  //}

  // sell an article
  function sellArticle(string memory _name, string memory _description, uint256 _price, string memory _duedate, bool _payed_back, bool _donated_money) public {
    // new article so increment articleCounter
    articleCounter++;

    // storing articles
    articles[articleCounter] = Article(
      articleCounter,
      msg.sender,
      address(0),
      _name,
      _description,
      _price,
      _duedate,
      _payed_back,
      _donated_money
      );


    emit LogSellArticle(articleCounter, msg.sender, _name, _price);

  }

  // fetch number of articles
  function getNumberOfArticles() public view returns (uint) {
    return articleCounter;
  }

  // fetch and return all article IDs which are still for sale
  function getArticlesForSale() public view returns (uint[] memory) {
    // prepare an output array
    uint[] memory articleIds = new uint[](articleCounter);

    uint numberOfArticlesForSale = 0;
    // iterate over all the articles
    for (uint i = 1; i <= articleCounter; i++) {
      if (articles[i].buyer == address(0)) {
        articleIds[numberOfArticlesForSale] = articles[i].id;
        numberOfArticlesForSale++;
      }
    }

    // copying article ids into smaller forSale array
    uint[] memory forSale = new uint[](numberOfArticlesForSale);

    for (uint j = 0; j < numberOfArticlesForSale; j++) {
      forSale[j] = articleIds[j];
    }

    return forSale;
  }

  // fetching Sold articles
  function soldArticles() public view returns (uint[] memory) {
    // prepare an output array
    uint[] memory articleIds = new uint[](articleCounter);

    uint numberOfArticlesForSale = 0;
    // iterate over all the articles
    for (uint i = 1; i <= articleCounter; i++) {
      if (articles[i].buyer != address(0)) {
        articleIds[numberOfArticlesForSale] = articles[i].id;
        numberOfArticlesForSale++;
      }
    }

    // copying article ids into smaller forSale array
    uint[] memory sold_arti = new uint[](numberOfArticlesForSale);

    for (uint j = 0; j < numberOfArticlesForSale; j++) {
      sold_arti[j] = articleIds[j];
    }

    return sold_arti;
  }

  // buy an article
  function buyArticle(uint _id) payable public {
    // we check wether article is for sale
    require(articleCounter > 0);

    // we check if article exists
    require(_id > 0 && _id <= articleCounter);

    // we retrive the article
    Article storage article = articles[_id];

    // we chech wether article has not been sold yet
    require(article.buyer == address(0));

    // we dont allow the sender to buy his own article
    require(msg.sender != article.seller);

    // we check that value send corresponds to the price of the article
    require(msg.value == article.price);

    // keep buyer's information
    article.buyer = msg.sender;

    //. the buyer can pay the seller
    article.seller.transfer(msg.value);

    // trigger the event
    emit LogBuyArticle(_id, article.seller, article.buyer, article.name, article.price);
  }

  // buy an article
  function paybackLoan(uint _id) payable public {
    // we check wether article is for sale
    require(articleCounter > 0);

    // we check if article exists
    require(_id > 0 && _id <= articleCounter);

    // we retrive the article
    Article storage article = articles[_id];

    // we chech wether article has not been sold yet
    //require(article.buyer == address(0));

    // we dont allow the sender to buy his own article
    //require(msg.sender != article.seller);

    // we check that value send corresponds to the price of the article
    require(msg.value == article.price);

    article.seller = msg.sender;

    //. the seller can pay back to buyer
    article.buyer.transfer(msg.value);

    articles[_id].payed_back = true;

    // trigger the event
    //emit LogBuyArticle(_id, article.seller, article.buyer, article.name, article.price);
  }


  // donate an article
  function donateArticle(uint _id) payable public {
    // we check wether article is for sale
    require(articleCounter > 0);

    // we check if article exists
    require(_id > 0 && _id <= articleCounter);

    // we retrive the article
    Article storage article = articles[_id];

    // we chech wether article has not been sold yet
    require(article.buyer == address(0));

    // we dont allow the sender to buy his own article
    require(msg.sender != article.seller);

    // we check that value send corresponds to the price of the article
    require(msg.value == article.price);

    // keep buyer's information
    article.buyer = msg.sender;

    articles[_id].donated_money = true;
    articles[_id].payed_back = true;

    //. the buyer can pay the seller
    article.seller.transfer(msg.value);

    // trigger the event
    emit LogdonateArticle(_id, article.seller, article.buyer, article.name, article.price);
  }


}
