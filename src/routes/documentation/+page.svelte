<script>
import i18n from "../i18n.json";
import v from "../../lib/images/v.gif";
import w from "../../lib/images/w.gif";
import walls from "../../lib/images/walls.gif";
</script>
<svelte:head>
	<title>{i18n.title} | {i18n.documentation}</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="description" content="{i18n.documentation}" />
  <link rel="stylesheet" href="https://stackedit.io/style.css"/>
</svelte:head>

<div class="stackedit__html"><h1 id="オレンジ回収ロボットゲーム">オレンジ回収ロボットゲーム</h1>
<p>部屋中に散らかったオレンジ色の物体を真ん中に集めてくるロボットを作るゲームです。<br>
ロボットは物体を一度に一つしか持てないので、何度も往復する必要があります。</p>
<h2 id="座標">座標</h2>
<p>中央が原点 (0, 0) です。画面全体で－50～50です。（壁があるので動ける範囲は－45～45です。</p>
<h3 id="向きと角度">向きと角度</h3>
<p>x軸を起点に、左回り（反時計回り）に角度を測ります。範囲は-180°～180°です</p>
<h3 id="網掛けエリア">網掛けエリア</h3>
<p>中央の網掛けエリアにオブジェクトを移動させると得点になります。網掛けエリアは<span class="katex--inline"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>−</mo><mn>10</mn><mo>&lt;</mo><mi>x</mi><mo>&lt;</mo><mn>10</mn></mrow><annotation encoding="application/x-tex">-10 &lt; x &lt; 10</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height: 0.72777em; vertical-align: -0.08333em;"></span><span class="mord">−</span><span class="mord">10</span><span class="mspace" style="margin-right: 0.277778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right: 0.277778em;"></span></span><span class="base"><span class="strut" style="height: 0.5782em; vertical-align: -0.0391em;"></span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right: 0.277778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right: 0.277778em;"></span></span><span class="base"><span class="strut" style="height: 0.64444em; vertical-align: 0em;"></span><span class="mord">10</span></span></span></span></span>, <span class="katex--inline"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>−</mo><mn>10</mn><mo>&lt;</mo><mi>y</mi><mo>&lt;</mo><mn>10</mn></mrow><annotation encoding="application/x-tex">-10 &lt; y &lt; 10</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height: 0.72777em; vertical-align: -0.08333em;"></span><span class="mord">−</span><span class="mord">10</span><span class="mspace" style="margin-right: 0.277778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right: 0.277778em;"></span></span><span class="base"><span class="strut" style="height: 0.73354em; vertical-align: -0.19444em;"></span><span class="mord mathnormal" style="margin-right: 0.03588em;">y</span><span class="mspace" style="margin-right: 0.277778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right: 0.277778em;"></span></span><span class="base"><span class="strut" style="height: 0.64444em; vertical-align: 0em;"></span><span class="mord">10</span></span></span></span></span> の正方形です。</p>
<h2 id="時刻">時刻</h2>
<h3 id="time">time</h3>
<p>シミュレーションを開始してから経過した秒数。実際の時刻ではなく、シミュレーション上での時刻です（倍速の影響を受けます。）</p>
<h2 id="センサーデータ">センサーデータ</h2>
<h3 id="robot.nearwalls">robot.nearWalls</h3>
<img src={walls} alt="例"/>
<p>ロボットのセンサーが感知した壁のデータです。ロボットは、一定距離以内にある壁を感知することができます。<code>robot.nearWalls</code>により、ロボットが検知したすべての壁を配列としてアクセスできます。</p>
<pre class=" language-javascript"><code class="prism  language-javascript"><span class="token keyword">let</span> distance <span class="token operator">=</span> robot<span class="token punctuation">.</span>nearWalls<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>distance<span class="token punctuation">;</span>
<span class="token keyword">let</span> direction <span class="token operator">=</span> robot<span class="token punctuation">.</span>nearWalls<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>direction<span class="token punctuation">;</span>
</code></pre>
<dl>
<dt>distance</dt><dd>壁とロボットの距離です。ロボットが壁にぶつかっている場合、距離は0です。</dd>
<dt>direction</dt><dd>ロボットの進行方向を0°としたとき、壁のある方向が-180°～180°で表されています。壁がロボットの左にあるときにはプラスの値が、右にある時にはマイナスの値が入ります。</dd>
</dl>
<h3 id="robot.neartargets">robot.nearTargets</h3>
<p>ロボットのセンサーが感知した物体のデータです。壁センサーと同様に、距離と向きにアクセスできます。</p>
<h3 id="robot.position">robot.position</h3>
<p>ロボットの位置です。</p>
<pre class=" language-javascript"><code class="prism  language-javascript"><span class="token keyword">let</span> x <span class="token operator">=</span> robot<span class="token punctuation">.</span>position<span class="token punctuation">.</span>x<span class="token punctuation">;</span>
</code></pre>
<h3 id="robot.direction">robot.direction</h3>
<p>ロボットの向きです。右方向が0°です。</p>
<h2 id="ロボット操作">ロボット操作</h2>
<h3 id="robot.ontick">robot.onTick</h3>
<p>一定時間ごとに実行される関数です。onTickに関数を代入することで、ロボットをプログラミングすることができます。</p>
<pre class="language-javascript"><code class="prism  language-javascript">robot<span class="token punctuation">.</span><span class="token function-variable function">onTick</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{"{"}</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>time <span class="token operator">&lt;</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token punctuation">{"{"}</span>
    robot<span class="token punctuation">.</span>v <span class="token operator">=</span> <span class="token number">10</span><span class="token punctuation">;</span>
    robot<span class="token punctuation">.</span>w <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
  <span class="token punctuation">{"}"}</span> <span class="token keyword">else</span> <span class="token punctuation">{"{"}</span>
    robot<span class="token punctuation">.</span>v <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
    robot<span class="token punctuation">.</span>w <span class="token operator">=</span> <span class="token number">10</span><span class="token punctuation">;</span>
  <span class="token punctuation">{"}"}</span>
<span class="token punctuation">{"}"}</span>
</code></pre>
<h3 id="robot.v">robot.v</h3>
<img src={v} alt="例"/>
<p>前に進む速度を設定します。0～10に設定できます。</p>
<pre class=" language-javascript"><code class="prism  language-javascript">robot<span class="token punctuation">.</span>v <span class="token operator">=</span> <span class="token number">3</span>
</code></pre>
<h3 id="robot.ｗ">robot.ｗ</h3>
<img src={w} alt="例"/>
<p>ロボットの回転速度を設定します。-15～15に設定できます。プラスが左回り（反時計回り）で、マイナスが右回り（時計回り））です。</p>
<h3 id="robot.pick">robot.pick()</h3>
<p>物体を拾います。拾える物体がないときは、何もしません。</p>
<h3 id="robot.dump">robot.dump()</h3>
<p>物体を下ろします。物体を持っていないときは、何もしません。</p>
<h2 id="関数">関数</h2>
<h3 id="directionx1-y1-x2-y2">direction(x1, y1, x2, y2)</h3>
<p>点(x2, y2)からみたときの、点(x1, y1)の方向を計算します。</p>
<pre class=" language-javascript"><code class="prism  language-javascript"><span class="token keyword">let</span> a <span class="token operator">=</span> <span class="token function">direction</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">,</span> <span class="token number">10</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">// a = 45</span>
</code></pre>
<h3 id="distancex1-y1-x2-y2">distance(x1, y1, x2, y2)</h3>
<p>点(x1, y1)と点(x2, y2)の距離を計算します。</p>
<h2 id="デバッグ用">デバッグ用</h2>
<h3 id="watch">watch</h3>
<p>変数を表示します。以下は、速度を表示する例です。</p>
<pre class=" language-javascript"><code class="prism  language-javascript"><span class="token function">watch</span><span class="token punctuation">(</span><span class="token string">"速度"</span><span class="token punctuation">,</span> robot<span class="token punctuation">.</span>v<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>
<h2 id="シミュレーションと得点">シミュレーションと得点</h2>
<p>「実行」を押すと、あなたのロボットが実行されます。</p>
<p>「シード値」を変更すると、乱数が変わります。(部屋の配置が換わります。)</p>
<p>「採点」を押すと、あなたのロボットが100種類の部屋でテストされます。しばらく時間がたったあと、平均得点が表示されます。</p>
</div>
<hr>
<address>作者: ゆりは (<a href="https://misskey-square.net/@yuriha">@yuriha@misskey-square.net</a>)</address>
<style>
h2 {
    font-size: 130%;
    font-weight: bold;
    background: #eee;
    border-left: 1em solid #6af;
    padding: 0.2em 0.5em;
    clear: both;
    margin: 1.2rem 0 0.7rem;
}
h3 {
    border-left: 3px solid #fa0;
    padding: 0.3rem 1rem;
    font-weight: bold;
    background: #eee;
    clear: both;
    margin: 0.2rem;
}
img {
    margin: 0.5rem;
    padding: 0.3rem;
    background: #fff;
    float: right;
}
p {
    padding: 0.5em;
}
.stackedit__html {
  width: 96%;
  padding-left: 2% !important;
  padding-right: 2% !important;
  background-color: #f4f4f4;
}
</style>
