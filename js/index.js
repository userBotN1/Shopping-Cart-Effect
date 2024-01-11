/**
 * Object: A single good/item
 */
class Item {
  constructor(item) {
    this.data = item;
    this.choose = 0;
  }

  getTotalPrice() {
    return this.data.price * this.choose;
  }
  isChoose() {
    return this.choose > 0;
  }
  increase() {
    this.choose += 1;
  }
  decrease() {
    if (this.choose === 0) {
      return;
    }
    this.choose -= 1;
  }
}

/**
 * Object: Entire interface (merchant)
 */
class UIData {
  constructor() {
    const uiGoods = [];
    for (const element of goods) {
      uiGoods.push(new Item(element));
    }
    this.uiGoods = uiGoods;
    this.deliveryThreshold = 30; // Hardcoding
    this.deliveryPrice = 5; // Hardcoding
  }

  getTotalPrice() {
    let sum = 0;
    for (const element of this.uiGoods) {
      sum += element.getTotalPrice();
    }
    return sum;
  }

  increase(index) {
    this.uiGoods[index].increase();
  }

  decrease(index) {
    this.uiGoods[index].decrease();
  }

  getTotalChooseNumber() {
    let sum = 0;
    for (const element of this.uiGoods) {
      sum += element.choose;
    }
    return sum;
  }

  hasGoodsInCart() {
    return this.getTotalChooseNumber() > 0;
  }

  isOverDeliveryThreshold() {
    return this.getTotalPrice() >= this.deliveryThreshold;
  }

  isChoose(index) {
    return this.uiGoods[index].isChoose();
  }

  choose(index) {
    return this.uiGoods[index].choose;
  }
}

class UI {
  constructor() {
    this.uiData = new UIData();
    this.doms = {
      goodsContainer: document.querySelector(".goods-list"),
      deliveryPrice: document.querySelector(".footer-car-tip"),
      footerPay: document.querySelector(".footer-pay"),
      footerPayInnerSpan: document.querySelector(".footer-pay span"),
      price: document.querySelector(".footer-car-total"),
      footerCart: document.querySelector(".footer-car"),
      footerCartBadge: document.querySelector(".footer-car-badge"),
    };

    const cartRect = this.doms.footerCart.getBoundingClientRect();
    const jumpTarget = {
      x: cartRect.left + cartRect.width / 2,
      y: cartRect.top + cartRect.height / 4,
    };
    this.jumpTarget = jumpTarget;

    this.createHTML();
    this.updateFooter();
    this.listenEvent();
  }

  listenEvent() {
    this.doms.footerCart.addEventListener("animationend", function () {
      this.classList.remove("animate");
    });
  }

  /**
   * Construct item lists
   */
  createHTML() {
    let html = ``;
    this.uiData.uiGoods.forEach(function (element, index) {
      html += `
        <div class="goods-item">
          <img src="${element.data.pic}" alt="" class="goods-pic" />
          <div class="goods-info">
            <h2 class="goods-title">${element.data.title}</h2>
            <p class="goods-desc">
              ${element.data.desc}
            </p>
            <p class="goods-sell">
              <span>Selling ${element.data.sellNumber}</span>
              <span>Rate ${element.data.favorRate}%</span>
            </p>
            <div class="goods-confirm">
              <p class="goods-price">
                <span class="goods-price-unit">$</span>
                <span>${element.data.price}</span>
              </p>
              <div class="goods-btns">
                <i index=${index} class="iconfont i-jianhao"></i>
                <span>0</span>
                <i index=${index} class="iconfont i-jiajianzujianjiahao"></i>
              </div>
            </div>
          </div>
        </div>`;
    });

    this.doms.goodsContainer.innerHTML = html;
  }

  increase(index) {
    this.uiData.increase(index);
    this.updateGoodsItem(index);
    this.updateFooter();
    this.jump(index);
  }

  decrease(index) {
    this.uiData.decrease(index);
    this.updateGoodsItem(index);
    this.updateFooter();
  }

  updateGoodsItem(index) {
    const goodsDom = this.doms.goodsContainer.children[index];
    if (this.uiData.isChoose(index)) {
      goodsDom.classList.add("active");
    } else {
      goodsDom.classList.remove("active");
    }

    const span = goodsDom.querySelector(".goods-btns span");
    span.textContent = this.uiData.choose(index);
  }

  updateFooter() {
    // Get total price
    const total = this.uiData.getTotalPrice();

    // Update delivery fee
    this.doms.deliveryPrice.textContent = `Delivery fee: $${this.uiData.deliveryPrice}`;

    if (this.uiData.isOverDeliveryThreshold()) {
      this.doms.footerPay.classList.add("active");
    } else {
      this.doms.footerPay.classList.remove("active");
      const diff = Math.round(this.uiData.deliveryThreshold - total);
      this.doms.footerPayInnerSpan.textContent = `Still need $${diff} to deliver`;
    }

    this.doms.price.textContent = total.toFixed(2);

    // Set shopping cart status
    if (this.uiData.hasGoodsInCart()) {
      this.doms.footerCart.classList.add("active");
    } else {
      this.doms.footerCart.classList.remove("active");
    }

    // Set shopping cart badge quantity
    this.doms.footerCartBadge.textContent = this.uiData.getTotalChooseNumber();
  }

  cartAnimate() {
    this.doms.footerCart.classList.add("animate");
  }

  jump(index) {
    let btnAdd = this.doms.goodsContainer.children[index].querySelector(
      ".i-jiajianzujianjiahao"
    );

    const btnRect = btnAdd.getBoundingClientRect();
    const jumpStart = {
      x: btnRect.left,
      y: btnRect.top,
    };

    // Create "jumping" object
    const div = document.createElement("div");
    div.className = "add-to-car";
    const i = document.createElement("i");
    i.className = "iconfont i-jiajianzujianjiahao";
    div.appendChild(i);
    document.body.appendChild(div);

    // Set starting position
    div.style.transform = `translateX(${jumpStart.x}px)`;
    i.style.transform = `translateY(${jumpStart.y}px)`;

    // Enforce rendering
    div.clientHeight;

    // Set ending position
    div.style.transform = `translateX(${this.jumpTarget.x}px)`;
    i.style.transform = `translateY(${this.jumpTarget.y}px)`;

    // Clean up after transform
    div.addEventListener(
      "transitionend",
      () => {
        div.remove();
        this.cartAnimate();
      },
      { once: true }
    );
  }
}

const ui = new UI();
ui.doms.goodsContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("i-jiajianzujianjiahao")) {
    const index = +e.target.getAttribute("index");
    ui.increase(index);
  } else if (e.target.classList.contains("i-jianhao")) {
    const index = +e.target.getAttribute("index");
    ui.decrease(index);
  }
});
