
module schat::chat {
    use sui::transfer;
    use sui::sui::SUI;
    use sui::coin::{Self, Coin};
    use sui::object::{Self, UID};
    use sui::balance::{Self, Balance};
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use std::string::{Self, String};

    struct OwnerCap has key { id: UID }

    struct ChatFee has key {
        id: UID,
        fee: u64,
        balance: Balance<SUI>
    }

    struct MessageSended has copy, drop {
        sender: address,
        message: String,
    }

    fun init(ctx: &mut TxContext) {
        transfer::transfer(OwnerCap {id: object::new(ctx)}, tx_context::sender(ctx));
        transfer::share_object(ChatFee {
            id: object::new(ctx),
            fee: 100,
            balance: balance::zero()
        });
    }

    public entry fun send_msg(chatfee: &mut ChatFee, payment: &mut Coin<SUI>, msg_bytes: vector<u8>, ctx: &mut TxContext) {
        assert!(coin::value(payment) >= chatfee.fee, 0);
	let sender = tx_context::sender(ctx);
        event::emit(MessageSended {
            sender: sender,
            message: string::utf8(msg_bytes)
        });
        let coin_balance = coin::balance_mut(payment);
        let paid = balance::split(coin_balance, chatfee.fee);
        balance::join(&mut chatfee.balance, paid);
    }

    public entry fun collect_profits(_: &OwnerCap, chatfee: &mut ChatFee, ctx: &mut TxContext) {
        let amount = balance::value(&chatfee.balance);
        let profits = coin::take(&mut chatfee.balance, amount, ctx);
        transfer::transfer(profits, tx_context::sender(ctx))
    }
}
